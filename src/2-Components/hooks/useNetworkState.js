import {useEffect, useState} from 'react';

//Add this custom hook for network monitoring (create a new file)
export const useNetworkState = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [networkQuality, setNetworkQuality] = useState('good');

    useEffect(()=>{
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Simple network quality detection
        const checkNetworkQuality = async () => {
            try {
                const startTime = Date.now();
                await fetch('https://www.google.com/favicon.ico', {
                    method: 'HEAD',
                    cache: 'no-cache'
                });
                const latency = Date.now() - startTime;

                if (latency > 1000) setNetworkQuality('poor');
                else if (latency > 500) setNetworkQuality('average');
                else setNetworkQuality('good')
            } catch (error) {
                setNetworkQuality('poor')
            }
        };

        const interval = setInterval(checkNetworkQuality, 30000);
        checkNetworkQuality();

        return () => {
            window.removeEventListener('online', handleOffline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        }
    },[]);

    return {isOnline, networkQuality};
}