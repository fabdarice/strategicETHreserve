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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { MarketingModal } from "@/components/MarketingModal";
import { InfluencerMarketingModal } from "@/components/InfluencerMarketingModal";
import { Company, Influencer } from "@/app/interfaces/interface";

export default function AdminPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedCompanies, setEditedCompanies] = useState<Company[]>([]);
  const [editedInfluencers, setEditedInfluencers] = useState<Influencer[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newInfluencer, setNewInfluencer] = useState({
    name: "",
    avatar: "",
    description: "",
    commitment: "",
    twitter: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      console.log(adminToken);
      const response = await fetch("/api/admin", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const data = await response.json();
      setCompanies(data.companies);
      setEditedCompanies(data.companies);
      setInfluencers(data.influencers);
      setEditedInfluencers(data.influencers);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (
    type: "company" | "influencer",
    id: string,
    field: string,
    value: any
  ) => {
    if (type === "company") {
      setCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === id ? { ...company, [field]: value } : company
        )
      );
      setEditedCompanies((prevCompanies) =>
        prevCompanies.map((company) =>
          company.id === id ? { ...company, [field]: value } : company
        )
      );
    } else {
      setInfluencers((prevInfluencers) =>
        prevInfluencers.map((influencer) =>
          influencer.id === id ? { ...influencer, [field]: value } : influencer
        )
      );
      setEditedInfluencers((prevInfluencers) =>
        prevInfluencers.map((influencer) =>
          influencer.id === id ? { ...influencer, [field]: value } : influencer
        )
      );
    }
  };

  const handleSave = async (type: "company" | "influencer", id: string) => {
    try {
      const adminToken = localStorage.getItem("admin_token");
      const itemToUpdate =
        type === "company"
          ? companies.find((c) => c.id === id)
          : influencers.find((i) => i.id === id);

      if (!itemToUpdate) return;

      const response = await fetch("/api/admin", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          type,
          id,
          data: itemToUpdate,
        }),
      });

      if (!response.ok) throw new Error("Update failed");

      toast.success("Updated successfully");
      fetchData();
    } catch (error) {
      toast.error("Failed to update");
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

      if (!response.ok) throw new Error("Creation failed");

      toast.success("Influencer created successfully");
      setIsCreateDialogOpen(false);
      setNewInfluencer({
        name: "",
        avatar: "",
        description: "",
        commitment: "",
        twitter: "",
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to create influencer");
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue="companies">
        <TabsList>
          <TabsTrigger value="companies">Companies</TabsTrigger>
          <TabsTrigger value="influencers">Influencers</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Logo URL</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Commitment %</TableHead>
                <TableHead>Current Reserve</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>News</TableHead>
                <TableHead>Marketing</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Input
                      value={company.name}
                      onChange={(e) =>
                        handleUpdate(
                          "company",
                          company.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={company.logo}
                      onChange={(e) =>
                        handleUpdate(
                          "company",
                          company.id,
                          "logo",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={company.category}
                      onChange={(e) =>
                        handleUpdate(
                          "company",
                          company.id,
                          "category",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={company.commitmentPercentage}
                      onChange={(e) =>
                        handleUpdate(
                          "company",
                          company.id,
                          "commitmentPercentage",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={company.currentReserve}
                      onChange={(e) =>
                        handleUpdate(
                          "company",
                          company.id,
                          "currentReserve",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      value={company.status}
                      onChange={(e) => {
                        handleUpdate(
                          "company",
                          company.id,
                          "status",
                          e.target.value
                        );
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="ACTIVE">ACTIVE</option>
                    </select>
                  </TableCell>
                  <TableCell>
                    <Input
                      value={company.news}
                      onChange={(e) =>
                        handleUpdate(
                          "company",
                          company.id,
                          "news",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <MarketingModal company={company}>
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                    </MarketingModal>
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleSave("company", company.id)}>
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="influencers">
          <div className="mb-4">
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>Add New Influencer</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Influencer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newInfluencer.name}
                      onChange={(e) =>
                        setNewInfluencer({
                          ...newInfluencer,
                          name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      value={newInfluencer.avatar}
                      onChange={(e) =>
                        setNewInfluencer({
                          ...newInfluencer,
                          avatar: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newInfluencer.description}
                      onChange={(e) =>
                        setNewInfluencer({
                          ...newInfluencer,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commitment">Commitment</Label>
                    <Input
                      id="commitment"
                      value={newInfluencer.commitment}
                      onChange={(e) =>
                        setNewInfluencer({
                          ...newInfluencer,
                          commitment: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={newInfluencer.twitter}
                      onChange={(e) =>
                        setNewInfluencer({
                          ...newInfluencer,
                          twitter: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={handleCreateInfluencer} className="w-full">
                    Create Influencer
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Avatar URL</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Commitment</TableHead>
                <TableHead>Twitter</TableHead>
                <TableHead>Marketing</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editedInfluencers.map((influencer) => (
                <TableRow key={influencer.id}>
                  <TableCell>
                    <Input
                      value={influencer.name}
                      onChange={(e) =>
                        handleUpdate(
                          "influencer",
                          influencer.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={influencer.avatar || ""}
                      onChange={(e) =>
                        handleUpdate(
                          "influencer",
                          influencer.id,
                          "avatar",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={influencer.description}
                      onChange={(e) =>
                        handleUpdate(
                          "influencer",
                          influencer.id,
                          "description",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={influencer.commitment}
                      onChange={(e) =>
                        handleUpdate(
                          "influencer",
                          influencer.id,
                          "commitment",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={influencer.twitter || ""}
                      onChange={(e) =>
                        handleUpdate(
                          "influencer",
                          influencer.id,
                          "twitter",
                          e.target.value
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <InfluencerMarketingModal influencer={influencer}>
                      <Button variant="outline" size="sm">
                        Share
                      </Button>
                    </InfluencerMarketingModal>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleSave("influencer", influencer.id)}
                    >
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  );
}
