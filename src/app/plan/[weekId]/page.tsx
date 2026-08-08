import PlanView from "./PlanView";

export default function PlanPage({ params }: { params: { weekId: string } }) {
  return <PlanView weekId={params.weekId} />;
}
