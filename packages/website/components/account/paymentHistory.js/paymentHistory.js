const PaymentHistoryTable = props => {
  const date = new Date();
  return (
    <div className="billing-card">
      <div className="payment-history-table">
        <div className="payment-history-table-body">
          {Array.from([5, 4, 3, 2, 1]).map((_, i) => (
            <div key={`payment-${i}`} className="payment-history-table-row">
              <span>{new Date(date.setMonth(date.getMonth() - 1)).toLocaleDateString()}</span>
              <span>$100</span>
              <span>Invoice-00{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PaymentHistoryTable;
