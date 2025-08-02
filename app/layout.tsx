
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { Providers } from "./provider";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";




const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "VAsA – Virtual Assistant’s Assistant",
  description: "Your command center for managing tasks, clients, and productivity.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${workSans.variable} ${workSans.variable} antialiased`}>
       <AuthProvider>
        <Providers>
          <main className="p-3 bg-white dark:bg-gray-900">{children}</main>
          <ToastContainer />
          <Toaster position="top-right" />
        </Providers>
        </AuthProvider>
        <footer className="bg-gray-100 py-4 dark:bg-gray-800">
          <div className="container mx-auto text-center">
            <p className="text-sm text-gray-600">
              &copy; {new Date().getFullYear()} VAsA. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

