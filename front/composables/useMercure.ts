export type MercureOptions = {
    withCredentials?: boolean;
    accessToken?: string | null;
};

export function useMercure() {
    const config = useRuntimeConfig();

    function subscribe(topics: string[], onMessage: (data: any) => void, options: MercureOptions = {}) {
        if (typeof window === 'undefined') return () => {};
        const hub = config.public.mercureHub as string | undefined;
        if (!hub || !Array.isArray(topics) || topics.length === 0) return () => {};

        const params = new URLSearchParams();
        for (const t of topics) params.append('topic', t);
        if (options.accessToken) params.append('access_token', options.accessToken);

        const url = `${hub}?${params.toString()}`;
        const es = new EventSource(url, { withCredentials: !!options.withCredentials });

        const handler = (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data);
                onMessage?.(data);
            } catch {
                // ignore non-JSON messages
            }
        };
        es.addEventListener('message', handler);

        return () => {
            try {
                es.removeEventListener('message', handler as any);
                es.close();
            } catch {}
        };
    }

    return { subscribe };
}
