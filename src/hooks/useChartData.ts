import { useState, useEffect } from 'react';
import { generateDummyData, type CandleData } from '../utils/generateDummyData';

export function useChartData(count: number = 150) {
    const [data, setData] = useState<CandleData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API call delay
        const timer = setTimeout(() => {
            const generatedData = generateDummyData(count);
            setData(generatedData);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [count]);

    return { data, loading };
}