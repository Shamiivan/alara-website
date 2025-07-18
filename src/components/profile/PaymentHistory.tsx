import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Loader2, Download, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import supabase from "@/lib/supabase";
import { PaymentHistory as PaymentHistoryType } from "@/types/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentHistoryProps {
  userId: string;
}

const PaymentHistory = ({ userId }: PaymentHistoryProps) => {
  const [payments, setPayments] = useState<PaymentHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        setIsLoading(true);

        const { data, error } = await supabase
          .from("payment_history")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setPayments(data as PaymentHistoryType[]);
      } catch (error) {
        console.error("Error fetching payment history:", error);
        toast({
          title: "Error",
          description: "Failed to load payment history. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchPaymentHistory();
    }
  }, [userId]);

  // Format amount from cents to dollars
  const formatAmount = (amount: number | null) => {
    if (amount === null) return "$0.00";
    return `$${(amount / 100).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Get status badge color
  const getStatusColor = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-800";

    switch (status.toLowerCase()) {
      case "succeeded":
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">No payment history found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{formatDate(payment.created_at)}</TableCell>
              <TableCell>{formatAmount(payment.amount)}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    payment.status
                  )}`}
                >
                  {payment.status || "Unknown"}
                </span>
              </TableCell>
              <TableCell>
                {payment.invoice_url ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a
                      href={payment.invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </a>
                  </Button>
                ) : (
                  <span className="text-gray-400 text-sm">N/A</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PaymentHistory;