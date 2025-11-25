import Head from 'next/head';
import ContactForm from '../components/ContactForm';

export default function ContactUs() {
  return (
    <>
      <Head>
        <title>Contact Us - Your Site Name</title>
        <meta name="description" content="Get in touch with us. We'd love to hear from you!" />
      </Head>
      
      <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Contact Us
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Have questions? We're here to help!
            </p>
          </div>
          
          <div className="mt-12">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};
