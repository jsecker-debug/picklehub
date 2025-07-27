import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";
import { format } from "date-fns";

// Mock payment data
const mockPaymentData = {
  currentBalance: 45.00,
  upcomingPayments: [
    {
      id: 1,
      sessionDate: "2024-01-20",
      sessionName: "Weekend Tournament",
      amount: 25.00,
      dueDate: "2024-01-18",
      status: "pending"
    },
    {
      id: 2,
      sessionDate: "2024-01-25",
      sessionName: "Thursday Evening Play",
      amount: 15.00,
      dueDate: "2024-01-23",
      status: "pending"
    }
  ],
  paymentHistory: [
    {
      id: 3,
      sessionDate: "2024-01-15",
      sessionName: "Monday Morning Session",
      amount: 15.00,
      paidDate: "2024-01-13",
      status: "paid"
    },
    {
      id: 4,
      sessionDate: "2024-01-10",
      sessionName: "Weekend Drop-in",
      amount: 20.00,
      paidDate: "2024-01-08",
      status: "paid"
    },
    {
      id: 5,
      sessionDate: "2024-01-05",
      sessionName: "New Year Tournament",
      amount: 30.00,
      paidDate: null,
      dueDate: "2024-01-03",
      status: "overdue"
    }
  ]
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      );
    case "overdue":
      return (
        <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="h-3 w-3 mr-1" />
          Overdue
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const Payments = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payments</h1>
        <p className="text-muted-foreground mt-2">
          Manage your session payments and billing
        </p>
      </div>

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount Due</p>
              <p className="text-2xl font-bold text-red-500">
                ${mockPaymentData.currentBalance.toFixed(2)}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Month Paid</p>
              <p className="text-2xl font-bold text-green-500">$50.00</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
              <p className="text-2xl font-bold text-card-foreground">•••• 4242</p>
            </div>
            <CreditCard className="h-8 w-8 text-chart-1" />
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pay Outstanding Balance
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Update Payment Method
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Set Auto-Pay
          </Button>
        </div>
      </Card>

      {/* Upcoming Payments */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Upcoming Payments</h2>
        {mockPaymentData.upcomingPayments.length > 0 ? (
          <div className="space-y-4">
            {mockPaymentData.upcomingPayments.map((payment) => (
              <div 
                key={payment.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-card-foreground">
                      {payment.sessionName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Session: {format(new Date(payment.sessionDate), 'MMM d, yyyy')} • 
                      Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-card-foreground">
                    ${payment.amount.toFixed(2)}
                  </span>
                  {getStatusBadge(payment.status)}
                  <Button size="sm">Pay Now</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No upcoming payments
          </div>
        )}
      </Card>

      {/* Payment History */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">Payment History</h2>
        <div className="space-y-4">
          {mockPaymentData.paymentHistory.map((payment) => (
            <div 
              key={payment.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-card-foreground">
                    {payment.sessionName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Session: {format(new Date(payment.sessionDate), 'MMM d, yyyy')}
                    {payment.paidDate && (
                      <> • Paid: {format(new Date(payment.paidDate), 'MMM d, yyyy')}</>
                    )}
                    {payment.status === 'overdue' && payment.dueDate && (
                      <> • Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-card-foreground">
                  ${payment.amount.toFixed(2)}
                </span>
                {getStatusBadge(payment.status)}
                {payment.status === 'overdue' && (
                  <Button size="sm" variant="destructive">Pay Now</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Payments;