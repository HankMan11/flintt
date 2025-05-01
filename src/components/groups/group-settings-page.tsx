
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGroups } from "@/contexts/GroupsContext";
import { useNavigate } from "react-router-dom";

export function GroupSettingsPage() {
  const { activeGroup } = useGroups();
  const navigate = useNavigate();

  if (!activeGroup) {
    return (
      <Card className="m-6 p-6 text-center">
        <CardHeader>
          <CardTitle>No Active Group</CardTitle>
          <CardDescription>Please select a group to view its settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/groups")}>Back to Groups</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Group Settings</CardTitle>
          <CardDescription>Manage settings for <span className="font-semibold">{activeGroup.name}</span></CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <img src={activeGroup.icon} alt={activeGroup.name} className="h-14 w-14 rounded-full border" />
            <div>
              <div className="font-bold text-lg">{activeGroup.name}</div>
              <div className="text-muted-foreground">{activeGroup.description}</div>
            </div>
          </div>
          {/* You can expand this section: add forms to update group details, manage members, etc. */}
          <Button variant="outline" onClick={() => navigate("/groups")}>Back to Groups</Button>
        </CardContent>
      </Card>
    </div>
  );
}
