import useSWR from 'swr';

export interface BusinessProfile {
  isComplete: boolean;
  step: number;
  // additional fields as needed
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBusinessProfile() {
  const { data, error } = useSWR<BusinessProfile>('/api/business-profile', fetcher);
  return {
    profile: data,
    isLoading: !error && !data,
    isError: error,
  };
}
