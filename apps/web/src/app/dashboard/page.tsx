import dynamic from 'next/dynamic';
import DashboardLoading from './loading';

const DashboardClient = dynamic(() => import('@/components/DashboardClient'), { 
  ssr: false,
  loading: () => <DashboardLoading />
});

export default function DashboardPage() {
  return <DashboardClient />;
}
