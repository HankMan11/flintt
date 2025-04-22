
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChartBar } from "lucide-react";
import { useGroups } from "@/contexts/GroupsContext";

export function WeeklyStatsButton({ groupId }: { groupId: string }) {
  const [showStats, setShowStats] = useState(false);
  const [isWeekEnd, setIsWeekEnd] = useState(false);
  const { calculateWeeklyStats } = useGroups();

  useEffect(() => {
    const checkWeekEnd = () => {
      const today = new Date();
      setIsWeekEnd(today.getDay() === 0); // Sunday
    };
    checkWeekEnd();
  }, []);

  if (!isWeekEnd) return null;

  const stats = calculateWeeklyStats(groupId);

  return (
    <>
      <Button 
        className="w-full mb-4" 
        variant="outline"
        onClick={() => setShowStats(true)}
      >
        <ChartBar className="w-4 h-4 mr-2" />
        View Weekly Stats
      </Button>

      <Dialog open={showStats} onOpenChange={setShowStats}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weekly Group Stats</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <StatsSection title="Top Posters" data={stats.topPosters} />
            <StatsSection title="Most Reactions Received" data={stats.topLiked} />
            <StatsSection title="Most Active Reactors" data={stats.topReactors} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StatsSection({ title, data }) {
  return (
    <div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([userId, count], index) => (
            <div key={userId} className="flex justify-between items-center">
              <span>#{index + 1} {userId}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
