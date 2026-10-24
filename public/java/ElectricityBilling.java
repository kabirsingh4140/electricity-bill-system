import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Objects;

/** Standalone OOP demonstration. The hosted web application persists records in Netlify Database. */
public class ElectricityBilling {
    public static void main(String[] args) {
        try {
            Customer[] examples = {
                new ResidentialCustomer("C1001", "Aarav Sharma", "24, Model Town, Delhi"),
                new ResidentialCustomer("C1002", "Meera Patel", "18, Green Park, Delhi"),
                new CommercialCustomer("C1003", "Verma General Store", "7, Market Road, Delhi"),
                new ResidentialCustomer("C1004", "Riya Malhotra", "42, Ashok Vihar, Delhi"),
                new CommercialCustomer("C1005", "Sunrise Print House", "12, Station Road, Delhi")
            };
            int[][] readings = {{1240,1482},{1978,2165},{4375,4890},{1648,1856},{5830,6248}};
            for (int i = 0; i < examples.length; i++) {
                Bill bill = new Bill("EB-100" + (i + 1), examples[i], new Meter(readings[i][0], readings[i][1]), "2026-10");
                if (i == 1 || i == 3) bill.recordPayment(bill.getAmount(), LocalDate.of(2026,10,20));
                System.out.println(bill);
            }
            System.out.println("\nValidation example:");
            try { new Meter(500, 400); }
            catch (BillingException e) { System.out.println("Rejected: " + e.getMessage()); }
        } catch (BillingException e) {
            System.err.println("Billing error: " + e.getMessage());
        }
    }
}

class BillingException extends IllegalArgumentException {
    public BillingException(String message) { super(message); }
}

abstract class Customer {
    private final String customerId;
    private String name;
    private String address;
    protected Customer(String customerId, String name, String address) {
        this.customerId = required(customerId, "Customer ID");
        setName(name);
        setAddress(address);
    }
    static String required(String value, String field) {
        if (value == null || value.trim().isEmpty()) throw new BillingException(field + " is required.");
        return value.trim();
    }
    public String getCustomerId() { return customerId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = required(name, "Name"); }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = required(address, "Address"); }
    public abstract BigDecimal calculateBill(int units);
    public abstract String getType();
    protected BigDecimal charge(int units, int rate) {
        if (units < 0) throw new BillingException("Consumption cannot be negative.");
        return BigDecimal.valueOf(units).multiply(BigDecimal.valueOf(rate));
    }
}

class ResidentialCustomer extends Customer {
    private static final int RATE = 5;
    public ResidentialCustomer(String id, String name, String address) { super(id, name, address); }
    @Override public BigDecimal calculateBill(int units) { return charge(units, RATE); }
    @Override public String getType() { return "Residential"; }
}

class CommercialCustomer extends Customer {
    private static final int RATE = 8;
    public CommercialCustomer(String id, String name, String address) { super(id, name, address); }
    @Override public BigDecimal calculateBill(int units) { return charge(units, RATE); }
    @Override public String getType() { return "Commercial"; }
}

class Meter {
    private final int previousReading;
    private final int currentReading;
    public Meter(int previous, int current) {
        if (previous < 0 || current < previous) throw new BillingException("Current reading must be at least the non-negative previous reading.");
        previousReading = previous;
        currentReading = current;
    }
    public int getPreviousReading() { return previousReading; }
    public int getCurrentReading() { return currentReading; }
    public int getUnitsConsumed() { return currentReading - previousReading; }
}

class Bill {
    private final String billId;
    private final Customer customer;
    private final Meter meter;
    private final String period;
    private final BigDecimal amount;
    private Payment payment;
    public Bill(String id, Customer customer, Meter meter, String period) {
        billId = Customer.required(id, "Bill ID");
        this.customer = Objects.requireNonNull(customer, "Customer is required.");
        this.meter = Objects.requireNonNull(meter, "Meter is required.");
        try { java.time.YearMonth.parse(period); }
        catch (Exception e) { throw new BillingException("Billing period must use YYYY-MM."); }
        this.period = period;
        amount = customer.calculateBill(meter.getUnitsConsumed());
    }
    public String getBillId() { return billId; }
    public BigDecimal getAmount() { return amount; }
    public Payment getPayment() { return payment; }
    public boolean isPaid() { return payment != null; }
    public void recordPayment(BigDecimal paid, LocalDate date) {
        if (isPaid()) throw new BillingException("This bill is already paid.");
        if (paid == null || paid.compareTo(amount) != 0) throw new BillingException("Payment must equal the bill amount.");
        payment = new Payment(paid, date);
    }
    @Override public String toString() {
        return String.format("%s | %s | %s | %s | %d kWh | INR %s | %s", billId, customer.getName(), customer.getType(), period, meter.getUnitsConsumed(), amount.toPlainString(), isPaid() ? "Paid on " + payment.getPaymentDate() : "Unpaid");
    }
}

class Payment {
    private final BigDecimal amount;
    private final LocalDate paymentDate;
    public Payment(BigDecimal amount, LocalDate date) {
        if (amount == null || amount.signum() < 0) throw new BillingException("Payment amount cannot be negative.");
        if (date == null || date.isAfter(LocalDate.now())) throw new BillingException("Payment date must not be in the future.");
        this.amount = amount;
        paymentDate = date;
    }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getPaymentDate() { return paymentDate; }
    public String getStatus() { return "Paid"; }
}
