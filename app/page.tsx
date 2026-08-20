"use client"
// This line is named a 'directive' - so its a special instruction to Next.js,
// this is not normal code. Next.js can run components in two places: on the  server (before the page even reaches your browser).
// But this component needs to react to the user typing in real time, which only works in the browser. so 'use client'
// tells next.js: "run this one on the client (browser), not the server."

import { useState } from "react";
// This imports a tool called a "hook" from React. 
// Hooks are special functions that let a component do things like 
// "remeber" information between re-readers. useState is the hook that 
// lets us store a value (like what the user typed) and update it later. 
import zxcvbn from "zxcvbn";
// zxcvbn is the passwword-strength library we have installed. calling 
// zxcvbn (somePassword) analyses it and returns an object with a score,
// warnings, and suggestions are not calculated ourselves 
export default function Home() {
  // This is our component, lets think of it as a function that returns 
  // what should appear on the page. "export default" means this is 
  // the main thing this file provides to the rest of the app.

  
  const [password, setPassword] = useState("");
  // Every time 'password' changesm we run it through zxcvbn to get a 
  // fresh analysis. This isn't stored in its own useState but 
  // it's recalculated on every render, which is fine since zxcvbn 
  // runs fast and this keeps things simple for now 
  // This line creats a varible called "password" that starts as an 
  // empty string "".

  // useState ("") gives us back two things in an array:
  // 1. 'password' -> the current value (starts as "")
  // 2. 'setPassword' -> a fucntion we call whenever we want to CHANGE that value 

  // Why not just use a normal variable like 'let password = ""'?
  // because React doesn't know when a normal variable changes, so the 
  // page wouldn't update. When you call 'setPasswrod(...)', React knows
  // to re-run this component and redraw the page with the new value. 
  const result = zxcvbn(password);
  // zxcvbn's score is a number from 0 to 4. We map that number to a 
  // human-readbale label to actually show on screen. 

  const strengthLabels = [
    "Very Weak",
    "Weak",
    "Fair",
    "Strong",
    "Very Strong",
  ];
  const strengthLabel = strengthLabels[result.score];
  // zxcvbn gives us specific feedback in result.feedback - a 'warning'
  // (why it's weak, if applicable) and 'suggestions' (an array of tips).
  // Both can be empty strongs/arrays if the passwrod if already strong.
  
  const { warning, suggestions } = result.feedback;
  return (
    // Everything below this line is JSX, it does look like HTML, however do not be fooled
    // it's actually just JavaScript that describes what the page should look like.
    // React then turns this into a real HTML in the browser - clever!

    < div className ="min-h-screen bg-zinc-50 flex flex-col items-center px-6 py-16">
      {/* This outer <div> just acts as a container for the whole page.
          className is how we add CSS styling in React (like "class" attribute in plain HTML). These particular classes come from
          Tailwind CSS */}
       <div className="w-full max-w-xl">
        {/* A second container that limits how wide the content gets,
            so it doesn't stretch across the whole screen on big monitors. */}
        
        {/*------------- Page Title ----------*/}
        <h1 className="text-5xl font-serif text-zinc-900 mb-4">
          How safe is your password?
        </h1>

        <p className="text-zinc-600 mb-10">
          Type a password and and we&apos;ll explain what makes it weaker or
          stronger — in plain language, nothing stored.
          {/* &apos; is just a safe way to write an apostrophe (') inside
              JSX so React doesn't get confused by it. */}
        </p>

        {/* ---------- The actual input box the user types into ---------- */}
        <input
          type="text"
          // `type="text"` means it's a normal visible text field.
          // (If you wanted to hide the characters like a real password
          // field, you'd use type="password" instead.)

          value={password}
          // This makes the input a "controlled" input — its visible text
          // is always exactly whatever is stored in our `password` state
          // variable. React is the single source of truth for what's shown.

          onChange={(e) => setPassword(e.target.value)}
          // onChange runs every single time the user types (or deletes)
          // a character. `e` is the "event" — an object describing what
          // just happened. `e.target.value` is the *new* full text
          // currently in the box. We take that and pass it to
          // setPassword(), which updates our state and triggers React
          // to re-render the page with the latest value.

          placeholder="Enter a password..."
          // Placeholder text — light gray text shown ONLY when the box
          // is empty, as a hint to the user. It disappears once they type.

          className="w-full rounded-xl bg-zinc-100 px-5 py-4 text-lg
                     text-zinc-800 placeholder-zinc-400 outline-none
                     focus:ring-2 focus:ring-zinc-300"
          // Styling only — rounded corners, padding, text size/color,
          // and a subtle ring/glow effect when the box is focused
          // (i.e. when the user has clicked into it).
        />

        {/* ---------- Feedback list ----------
            Right now this list is STATIC — it always shows the same
            three tips no matter what the user types. It doesn't yet
            "read" the `password` variable at all.

            Later, you could make each tip light up green/red, or change
            its text, based on things like:
              password.length > 12
              /[0-9]/.test(password)   (contains a number)
            /[A-Z]/.test(password)   (contains a capital letter)*/}
        {password.length > 0 && (
          <div className="mt-6">
            <p className="text-lg font-semibold text-zinc-900">
              {strengthLabel}
            </p>

            {warning && (
              <p className="mt-2 text-zinc-700">{warning}</p>
            )}

            {suggestions.length > 0 && (
              <ul className="mt-2 space-y-1 text-zinc-600">
                {suggestions.map((tip, i) => (
                  <li key={i}>💡 {tip}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <ul className="mt-10 space-y-4 text-zinc-700">
          {/* <ul> = "unordered list" (a bullet-point list container) */}

          <li>
            {/* <li> = one item in the list */}
            <span className="font-semibold">Length</span> — A longer
            password is almost always stronger, even random words strung
            together.
          </li>
          <li>
            <span className="font-semibold">Unpredictability</span> — Avoid
            names, birthdays, and anything connected to you personally.
          </li>
          <li>
            <span className="font-semibold">Uniqueness</span> — Reusing
            passwords means one breach can expose every account.
          </li>
        </ul>
      </div>
    </div>
  );
}