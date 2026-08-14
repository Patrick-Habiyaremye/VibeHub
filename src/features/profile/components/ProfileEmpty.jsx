export default function ProfileEmpty({ message, fullWidth = false }) {
  return (
    <p className={`text-gray-500 text-center ${fullWidth ? "col-span-full" : ""}`}>
      {message}
    </p>
  );
}
