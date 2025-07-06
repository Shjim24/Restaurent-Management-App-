// app/layout.tsx
import React from 'react';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

export const metadata = {
  title: 'FOODIE ',
  description: 'FOODIE - Your Food Comparison App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Add the external script inside the <head> using next/script */}
        {/* <Script
          src="https://chatsby.co/embed-loader.js?botId=3626f54d-de74-414f-87e1-2d42307bf87c"
          strategy="afterInteractive"
        /> */}
        
<Script id="chatbase-loader" strategy="afterInteractive">
  {`
    (function(){
      if(!window.chatbase || window.chatbase("getState")!=="initialized"){
        window.chatbase=(...arguments)=>{
          if(!window.chatbase.q){ window.chatbase.q=[] }
          window.chatbase.q.push(arguments)
        };
        window.chatbase=new Proxy(window.chatbase,{
          get(target,prop){
            if(prop==="q"){ return target.q }
            return(...args)=>target(prop,...args)
          }
        });
      }

      const onLoad=function(){
        const script=document.createElement("script");
        script.src="https://www.chatbase.co/embed.min.js";
        script.id="Fho5tNqdN2DPOPM1uT9H0";
        script.domain="www.chatbase.co";
        document.body.appendChild(script);
      };

      if(document.readyState==="complete"){
        onLoad();
      } else {
        window.addEventListener("load", onLoad);
      }
    })();
  `}
</Script>


        
      </head>
      <body>
        <Toaster position="top-right" />
        {children}
      </body>
    </html>
  );
}
