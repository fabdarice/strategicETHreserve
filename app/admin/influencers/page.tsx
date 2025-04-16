"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { InfluencerMarketingModal } from "@/components/InfluencerMarketingModal";
import { Influencer } from "@/app/interfaces/interface";
import Link from "next/link";

export default function AdminInfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedInfluencers, setEditedInfluencers] = useState<{
    [key: string]: Partial<Influencer>;
  }>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newInfluencer, setNewInfluencer] = useState<Omit<Influencer, "id">>({
    name: "",
    avatar: "",
    description: "",
    commitment: "",
    twitter: "",
    // Add other fields from Influencer interface if necessary, excluding 'id'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem("admin_token");
      if (!adminToken) {
        window.location.href = "/admin/login";
        return;
      }
      const response = await fetch("/api/admin", {
        // Still fetches both, uses influencers
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Unauthorized. Redirecting to login.");
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      const fetchedInfluencers = Array.isArray(data.influencers)
        ? data.influencers
        : [];
      setInfluencers(fetchedInfluencers);
      setEditedInfluencers({}); // Reset edits on fetch
    } catch (error: any) {
      console.error("Failed to fetch influencers:", error);
      toast.error(
        `Failed to fetch influencers: ${error.message || "Unknown error"}`
      );
      if (error.message.includes("Unauthorized")) {
        window.location.href = "/admin/login";
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    id: string,
    field: keyof Influencer,
    value: any
  ) => {
    setEditedInfluencers((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id: string) => {
    const influencerUpdates = editedInfluencers[id];
    const originalInfluencer = influencers.find((i) => i.id === id);

    if (!influencerUpdates || !originalInfluencer) {
      toast.error("Could not find influencer data to save.");
      return;
    }

    const payloadData = { ...originalInfluencer, ...influencerUpdates };

    try {
      const adminToken = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          type: "influencer",
          id,
          data: payloadData,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Unauthorized. Please login again.");
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Update failed: ${response.status}`
        );
      }

      toast.success("Influencer updated successfully");
      fetchData(); // Refetch to update UI and clear edits
    } catch (error: any) {
      console.error("Failed to update influencer:", error);
      toast.error(`Failed to update influencer: ${error.message}`);
    }
  };

  const handleCreateInfluencer = async () => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          type: "influencer",
          data: newInfluencer,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        toast.error("Unauthorized. Please login again.");
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Creation failed");
      }

      toast.success("Influencer created successfully");
      setIsCreateDialogOpen(false);
      setNewInfluencer({
        name: "",
        avatar: "",
        description: "",
        commitment: "",
        twitter: "",
      }); // Reset form
      fetchData(); // Refresh list
    } catch (error: any) {
      toast.error(`Failed to create influencer: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <nav className="mb-4">
          <Link href="/admin" className="mr-4 text-blue-500 hover:underline">
            Admin Home
          </Link>
          <Link
            href="/admin/companies"
            className="text-blue-500 hover:underline"
          >
            Manage Companies
          </Link>
        </nav>
        <h1 className="text-2xl font-bold mb-8">Manage Influencers</h1>
        <div>Loading Influencers...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <nav className="mb-4">
        <Link href="/admin" className="mr-4 text-blue-500 hover:underline">
          Admin Home
        </Link>
        <Link href="/admin/companies" className="text-blue-500 hover:underline">
          Manage Companies
        </Link>
      </nav>
      <h1 className="text-2xl font-bold mb-8">Manage Influencers</h1>

      <div className="mb-4">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add New Influencer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Influencer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Reusing the form structure from original component */}
              <div className="space-y-2">
                <Label htmlFor="create-name">Name</Label>
                <Input
                  id="create-name"
                  value={newInfluencer.name}
                  onChange={(e) =>
                    setNewInfluencer({ ...newInfluencer, name: e.target.value })
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-avatar">Avatar URL</Label>
                <Input
                  id="create-avatar"
                  value={newInfluencer.avatar ?? ""}
                  onChange={(e) =>
                    setNewInfluencer({
                      ...newInfluencer,
                      avatar: e.target.value,
                    })
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-description">Description</Label>
                <Input
                  id="create-description"
                  value={newInfluencer.description}
                  onChange={(e) =>
                    setNewInfluencer({
                      ...newInfluencer,
                      description: e.target.value,
                    })
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-commitment">Commitment</Label>
                <Input
                  id="create-commitment"
                  value={newInfluencer.commitment}
                  onChange={(e) =>
                    setNewInfluencer({
                      ...newInfluencer,
                      commitment: e.target.value,
                    })
                  }
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-twitter">
                  Twitter Handle (optional)
                </Label>
                <Input
                  id="create-twitter"
                  value={newInfluencer.twitter ?? ""}
                  onChange={(e) =>
                    setNewInfluencer({
                      ...newInfluencer,
                      twitter: e.target.value || null,
                    })
                  }
                  className="bg-background"
                />
              </div>
              <Button onClick={handleCreateInfluencer} className="w-full">
                Create Influencer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[200px]">Avatar URL</TableHead>
              <TableHead className="min-w-[250px]">Description</TableHead>
              <TableHead className="min-w-[200px]">Commitment</TableHead>
              <TableHead className="min-w-[150px]">Twitter</TableHead>
              <TableHead className="min-w-[100px]">Marketing</TableHead>
              <TableHead className="min-w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.map((influencer) => {
              const displayInfluencer = {
                ...influencer,
                ...(editedInfluencers[influencer.id] || {}),
              };
              return (
                <TableRow key={influencer.id}>
                  <TableCell>
                    <Input
                      value={displayInfluencer.name}
                      onChange={(e) =>
                        handleInputChange(influencer.id, "name", e.target.value)
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={displayInfluencer.avatar ?? ""} // Handle potentially null avatar
                      onChange={(e) =>
                        handleInputChange(
                          influencer.id,
                          "avatar",
                          e.target.value
                        )
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={displayInfluencer.description}
                      onChange={(e) =>
                        handleInputChange(
                          influencer.id,
                          "description",
                          e.target.value
                        )
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={displayInfluencer.commitment}
                      onChange={(e) =>
                        handleInputChange(
                          influencer.id,
                          "commitment",
                          e.target.value
                        )
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={displayInfluencer.twitter ?? ""} // Ensure value is string for Input
                      onChange={(e) =>
                        handleInputChange(
                          influencer.id,
                          "twitter",
                          e.target.value || null
                        )
                      }
                      className="bg-background"
                    />
                  </TableCell>
                  <TableCell>
                    <InfluencerMarketingModal
                      influencer={displayInfluencer as Influencer}
                    >
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                    </InfluencerMarketingModal>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleSave(influencer.id)}
                      disabled={!editedInfluencers[influencer.id]}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
