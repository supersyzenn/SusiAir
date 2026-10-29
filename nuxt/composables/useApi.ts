export function useApi() {
  const config = useRuntimeConfig();
  const session = useSessionStore();
  const router = useRouter();
  return async <T>(path:string, options:{ method?:'GET'|'POST';body?:Record<string,unknown>;signal?:AbortSignal } = {}):Promise<T> => {
    try {
      return await $fetch<T>(path,{
        baseURL:config.public.apiBase,
        ...options,
        headers:session.token ? { Authorization:`Bearer ${session.token}` } : {},
        retry:0,timeout:15000,
      }) as T;
    } catch (error) {
      const status = (error as {response?:{status:number}}).response?.status;
      if (status === 401 && path !== '/auth/login') {
        session.clear();
        await router.replace('/sign-in?session=expired');
      }
      throw error;
    }
  };
}
