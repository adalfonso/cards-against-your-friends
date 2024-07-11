import QRCode from "react-qr-code";

export const QrCode = ({ value }: { value: string }) => {
  return <QRCode value={value} size={256} />;
};
