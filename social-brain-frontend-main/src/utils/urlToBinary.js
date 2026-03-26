
export const urlToBinary = async (url, filename = 'image.jpg') => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
}