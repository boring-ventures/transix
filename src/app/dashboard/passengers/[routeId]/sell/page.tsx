import SellPageClient from './page.client'

export default function SellPage({ params }: { params: { routeId: string } }) {
  return <SellPageClient routeId={params.routeId} />
}
