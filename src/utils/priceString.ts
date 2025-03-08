export function formattedPrice(amount:number) {
    // Convert number to string
    const amountString = amount.toString();
    
    // Separate the last 3 digits
    const lastThreeDigits = amountString.slice(-3);
    let remainingDigits = amountString.slice(0, -3);
    
    // Add commas for every 2 digits in the remaining digits
    if (remainingDigits) {
        remainingDigits = remainingDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    }
    
    // Combine the formatted parts
    return remainingDigits ? `${remainingDigits},${lastThreeDigits}` : lastThreeDigits;
}