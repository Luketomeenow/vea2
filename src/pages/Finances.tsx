import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Plus, Search, DollarSign, TrendingUp, TrendingDown, Calendar, Download, Eye, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  category: string;
  date: string;
  status: "pending" | "completed" | "cancelled";
  client?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: string;
  issueDate: string;
}

const Finances = () => {
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "income",
      amount: 15000,
      description: "Q4 Consulting Services",
      category: "Consulting",
      date: "2024-01-10",
      status: "completed",
      client: "TechCorp Solutions"
    },
    {
      id: "2",
      type: "expense",
      amount: 2500,
      description: "Office Rent",
      category: "Overhead",
      date: "2024-01-08",
      status: "completed"
    },
    {
      id: "3",
      type: "income",
      amount: 8000,
      description: "Website Development",
      category: "Development",
      date: "2024-01-05",
      status: "pending",
      client: "StartupCo"
    }
  ]);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: "1",
      invoiceNumber: "INV-2024-001",
      client: "TechCorp Solutions",
      amount: 15000,
      status: "paid",
      dueDate: "2024-01-15",
      issueDate: "2024-01-01"
    },
    {
      id: "2",
      invoiceNumber: "INV-2024-002",
      client: "Innovate Industries",
      amount: 12000,
      status: "sent",
      dueDate: "2024-01-20",
      issueDate: "2024-01-05"
    },
    {
      id: "3",
      invoiceNumber: "INV-2024-003",
      client: "StartupCo",
      amount: 8000,
      status: "overdue",
      dueDate: "2024-01-10",
      issueDate: "2023-12-25"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<{
    type: "income" | "expense";
    amount: number;
    description: string;
    category: string;
    client: string;
  }>({
    type: "income",
    amount: 0,
    description: "",
    category: "",
    client: ""
  });

  const [newInvoice, setNewInvoice] = useState({
    client: "",
    amount: 0,
    dueDate: "",
    description: ""
  });

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netProfit = totalIncome - totalExpenses;
  const pendingInvoices = invoices.filter(inv => inv.status === "sent" || inv.status === "overdue");

  const handleCreateTransaction = () => {
    if (!newTransaction.description.trim() || newTransaction.amount <= 0) return;
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      ...newTransaction,
      date: new Date().toISOString().split('T')[0],
      status: "completed"
    };
    
    setTransactions([...transactions, transaction]);
    setNewTransaction({
      type: "income",
      amount: 0,
      description: "",
      category: "",
      client: ""
    });
    setIsTransactionDialogOpen(false);
    toast({
      title: "Transaction added",
      description: "New transaction has been recorded"
    });
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.client.trim() || newInvoice.amount <= 0) return;
    
    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-2024-${String(invoices.length + 1).padStart(3, '0')}`,
      ...newInvoice,
      status: "draft",
      issueDate: new Date().toISOString().split('T')[0]
    };
    
    setInvoices([...invoices, invoice]);
    setNewInvoice({
      client: "",
      amount: 0,
      dueDate: "",
      description: ""
    });
    setIsInvoiceDialogOpen(false);
    toast({
      title: "Invoice created",
      description: "New invoice has been generated"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid": return "default";
      case "pending":
      case "sent": return "secondary";
      case "cancelled":
      case "overdue": return "destructive";
      case "draft": return "outline";
      default: return "outline";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Finances</h1>
            <p className="text-white/70">Track your income, expenses, and invoices</p>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">${totalIncome.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">${totalExpenses.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-accent' : 'text-destructive'}`}>
                ${netProfit.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white">Pending Invoices</CardTitle>
              <Calendar className="h-4 w-4 text-secondary-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingInvoices.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Transactions and Invoices */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Transaction</DialogTitle>
                    <DialogDescription>Record a new income or expense transaction</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select 
                        value={newTransaction.type} 
                        onValueChange={(value: "income" | "expense") => setNewTransaction({...newTransaction, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Income</SelectItem>
                          <SelectItem value="expense">Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newTransaction.amount || ""}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                        placeholder="Transaction description"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                        placeholder="Category"
                      />
                    </div>
                    {newTransaction.type === "income" && (
                      <div>
                        <Label htmlFor="client">Client</Label>
                        <Input
                          id="client"
                          value={newTransaction.client}
                          onChange={(e) => setNewTransaction({...newTransaction, client: e.target.value})}
                          placeholder="Client name"
                        />
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTransaction}>Add Transaction</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${transaction.type === "income" ? "bg-primary" : "bg-destructive"}`} />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{transaction.category}</p>
                          {transaction.client && (
                            <p className="text-sm text-muted-foreground">Client: {transaction.client}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`font-medium ${transaction.type === "income" ? "text-primary" : "text-destructive"}`}>
                            {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="invoices" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-10"
                />
              </div>
              
              <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>Generate a new invoice for your client</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input
                        id="client"
                        value={newInvoice.client}
                        onChange={(e) => setNewInvoice({...newInvoice, client: e.target.value})}
                        placeholder="Client name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newInvoice.amount || ""}
                        onChange={(e) => setNewInvoice({...newInvoice, amount: Number(e.target.value)})}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newInvoice.dueDate}
                        onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={newInvoice.description}
                        onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                        placeholder="Services description"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateInvoice}>Create Invoice</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">Client: {invoice.client}</p>
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-lg">${invoice.amount.toLocaleString()}</p>
                        </div>
                        <Badge variant={getStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Finances;




