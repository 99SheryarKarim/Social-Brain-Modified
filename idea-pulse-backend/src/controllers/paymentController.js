const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const db = require('../../database/init');

exports.createCheckoutSession = async (req, res) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: userEmail,
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      metadata: { userId: String(userId), userEmail },
      success_url: `http://localhost:5173/#/upgrade?payment=success`,
      cancel_url:  `http://localhost:5173/#/upgrade?payment=cancelled`,
    });

    console.log(`💳 Checkout session created for user ${userId} (${userEmail})`);
    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.handleWebhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📨 Stripe webhook received: ${event.type}`);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata?.userId;
    const userEmail = session.metadata?.userEmail || session.customer_email;
    const stripeCustomerId = session.customer;
    const stripeSubId = session.subscription;

    const upgradeUser = (whereClause, params) => {
      db.run(
        `UPDATE users SET plan = 'premium', stripe_customer_id = ?, stripe_subscription_id = ? WHERE ${whereClause}`,
        [stripeCustomerId, stripeSubId, ...params],
        function(err) {
          if (err) console.error('❌ Failed to upgrade user:', err.message);
          else if (this.changes > 0) console.log(`✅ User upgraded to premium (${whereClause}: ${params})`);
          else console.warn(`⚠️ No user found to upgrade (${whereClause}: ${params})`);
        }
      );
    };

    if (userId) {
      upgradeUser('id = ?', [userId]);
    } else if (userEmail) {
      // Fallback: match by email
      upgradeUser('email = ?', [userEmail]);
    } else {
      console.error('❌ No userId or email in webhook metadata');
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object;
    db.run(
      `UPDATE users SET plan = 'free' WHERE stripe_subscription_id = ?`,
      [sub.id],
      function(err) {
        if (err) console.error('Failed to downgrade user:', err.message);
        else console.log(`⬇️ User downgraded to free (sub: ${sub.id})`);
      }
    );
  }

  res.status(200).json({ received: true });
};

exports.getPublishableKey = (req, res) => {
  res.status(200).json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
};
