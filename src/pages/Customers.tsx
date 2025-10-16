import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, Mail, Phone, MapPin, Building, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, Customer } from "@/services/customersService";

const Customers = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user?.id) return;
      setLoading(true);
      const data = await getCustomers(user.id);
      setCustomers(data);
      setLoading(false);
    };
    fetchCustomers();
  }, [user?.id]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState<{
    name: string;
    email: string;
    phone: string;
    company: string;
    city: string;
    state: string;
    country: string;
    customer_type: "individual" | "business";
    status: "active" | "inactive" | "lead" | "prospect";
  }>({
    name: "",
    email: "",
    phone: "",
    company: "",
    city: "",
    state: "",
    country: "USA",
    customer_type: "business",
    status: "prospect"
  });

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim() || !newCustomer.email.trim() || !user?.id) return;
    
    try {
      const createdCustomer = await createCustomer(user.id, newCustomer);
      
      if (createdCustomer) {
        setCustomers([createdCustomer, ...customers]);
        setNewCustomer({
          name: "",
          email: "",
          phone: "",
          company: "",
          city: "",
          state: "",
          country: "USA",
          customer_type: "business",
          status: "prospect"
        });
        setIsDialogOpen(false);
        toast.success("Customer added successfully");
      } else {
        toast.error("Failed to add customer");
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      toast.error("Failed to add customer");
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      const success = await deleteCustomer(customerId);
      
      if (success) {
        setCustomers(customers.filter(customer => customer.id !== customerId));
        toast.success("Customer deleted successfully");
      } else {
        toast.error("Failed to delete customer");
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error("Failed to delete customer");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "prospect": return "outline";
      default: return "outline";
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Customers</h1>
            <p className="text-white/70">Manage your customer relationships</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                  Add a new customer to your database
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newCustomer.company}
                    onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})}
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    placeholder="Business address"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={newCustomer.status} 
                    onValueChange={(value: "active" | "inactive" | "prospect") => setNewCustomer({...newCustomer, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCustomer}>Add Customer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="prospect">Prospects</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Customer Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-3">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading customers...</p>
            </div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <Card className="col-span-full text-center py-12">
            <CardContent>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "No customers found matching your criteria" 
                  : "No customers yet. Add your first customer to get started!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback>{getInitials(customer.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{customer.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {customer.company}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(customer.status)}>
                    {customer.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="truncate">{customer.address}</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{customer.customer_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Added:</span>
                    <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-3">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Customers;




