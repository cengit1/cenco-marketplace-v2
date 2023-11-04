import { SignIn } from "@clerk/nextjs";
import { useRouter } from 'next/router';

export default function Page() {
  const { query} = useRouter();

  const redirectUrl = decodeURIComponent(query.redirect_url as string ?? "/");
  console.log('redirect to:', redirectUrl);

  return <div className="sign-in-container">
    <SignIn redirectUrl={redirectUrl} />
  </div>;
}
