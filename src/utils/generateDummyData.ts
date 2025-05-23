// src/utils/generateDummyData.ts (updated)
export interface CandleData {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export function generateDummyData(count: number = 100): CandleData[] {
    const data: CandleData[] = [];
    // More realistic starting price
    let basePrice = 12500 + Math.random() * 1000;
    let baseVolume = 10000;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - count);

    for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);

        // More realistic price movement with occasional spikes
        const volatility = Math.random() < 0.1 ? 2.5 : 1; // Occasional higher volatility
        const change = (Math.random() - 0.5) * basePrice * 0.02 * volatility; // 2% max change with occasional spikes

        const open = basePrice;
        const close = basePrice + change;

        // More realistic high and low values
        const highExtra = Math.random() * basePrice * 0.01; // up to 1% higher than max of open/close
        const lowExtra = Math.random() * basePrice * 0.01; // up to 1% lower than min of open/close

        const high = Math.max(open, close) + highExtra;
        const low = Math.min(open, close) - lowExtra;

        // Volume correlates somewhat with price movement
        // src/utils/generateDummyData.ts (continued)
        // Volume correlates somewhat with price movement
        const volumeChange = Math.abs(change) / basePrice; // percentage change
        const volume = baseVolume * (1 + volumeChange * 5) + (Math.random() * baseVolume * 0.5);

        // Format the date as YYYY-MM-DD
        const formattedDate = date.toISOString().split('T')[0];

        data.push({
            time: formattedDate,
            open,
            high,
            low,
            close,
            volume
        });

        // Set next day's base price
        basePrice = close;

        // Simulate trends
        if (i % 20 === 0) {
            // Occasional trend shift
            basePrice = basePrice * (1 + (Math.random() - 0.5) * 0.05);
        }
    }

    return data;
}