const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../../database/init');

// Create Stripe checkout session
exports.createCheckoutSession = async (req, res) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: { userId: String(userId) },
      success_url: `http://localhost:5173/#/upgrade?payment=success`,
      cancel_url:  `http://localhost:5173/#/upgrade?payment=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// Stripe webhook — called by Stripe when payment succeeds
exports.handleWebhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const stripeCustomerId = session.customer;
    const stripeSubId = session.subscription;

    if (userId) {
      db.run(
        `UPDATE users SET plan = 'premium', stripe_customer_id = ?, stripe_subscription_id = ? WHERE id = ?`,
        [stripeCustomerId, stripeSubId, userId],
        (err) => {
          if (err) console.error('Failed to upgrade user:', err.message);
          else console.log(`✅ User ${userId} upgraded to premium`);
        }
      );
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    db.run(
      `UPDATE users SET plan = 'free' WHERE stripe_subscription_id = ?`,
      [sub.id],
      (err) => {
        if (err) console.error('Failed to downgrade user:', err.message);
        else console.log(`⬇️ Subscription cancelled, user downgraded to free`);
      }
    );
  }

  res.status(200).json({ received: true });
};

// Get Stripe publishable key for frontend
exports.getPublishableKey = (req, res) => {
  res.status(200).json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
};
