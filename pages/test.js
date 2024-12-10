export default function Test() {
  console.log("Environment variable:", process.env.NEXT_PUBLIC_API_URL);
  
  return (
    <div>
      API URL: {process.env.NEXT_PUBLIC_API_URL}
    </div>
  )
} 