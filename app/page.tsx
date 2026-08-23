"use client"
// This line is named a 'directive' - so its a special instruction to Next.js,
// this is not normal code. Next.js can run components in two places: on the  server (before the page even reaches your browser).
// But this component needs to react to the user typing in real time, which only works in the browser. so 'use client'
// tells next.js: "run this one on the client (browser), not the server."

import { useState, useEffect } from "react";
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
  const [breachCount, setBreachCount] = useState<number | null>(null);
  const [checkingBreach, setCheckingBreach] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"check" | "examples" | "HowItWorks" | "faq">("check");
  const [openExample, setOpenExample] = useState<number | null>(null);
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
  // useEffect runs some code automatically whenever something it's
  // watching (listed in the [] at the end) changes — here, whenever
  // `password` changes, this whole block runs again.
  useEffect(() => {
    // Don't bother checking an empty password.
    if (password.length === 0) {
      setBreachCount(null);
      return;
    }

    // A small delay (500ms) before actually checking — this stops us
    // firing off a network request on every single keystroke, which
    // would be wasteful and slow. Instead, it waits until you've
    // paused typing for half a second.
    const timeout = setTimeout(async () => {
      setCheckingBreach(true);
      try {
        const res = await fetch("/api/check-breach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        setBreachCount(data.breachCount ?? null);
      } catch {
        setBreachCount(null);
      } finally {
        setCheckingBreach(false);
      }
    }, 500);

    // Cleanup: if the password changes again before the 500ms is up
    // (i.e. you're still typing), cancel the previous timeout so we
    // don't check an outdated, half-typed password.
    return () => clearTimeout(timeout);
  }, [password]);
  return (
    < div className="min-h-screen bg-zinc-50 flex flex-col items-center px-6 py-16">
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
        <div className="flex gap-2 mb-10 bg-zinc-100 rounded-full p-1 w-fit">
          <button
            onClick={() => setActiveTab("check")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === "check" ? "bg-white text-zinc-900" : "text-zinc-500"
              }`}
          >
            Check
          </button>
          <button
            onClick={() => setActiveTab("examples")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === "examples" ? "bg-white text-zinc-900" : "text-zinc-500"
              }`}
          >
            Examples
          </button>
          <button
            onClick={() => setActiveTab("HowItWorks")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === "HowItWorks" ? "bg-white text-zinc-900" : "text-zinc-500"
              }`}
          >
            How it works
          </button>
          <button
            onClick={() => setActiveTab("faq")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === "faq" ? "bg-white text-zinc-900" : "text-zinc-500"
              }`}
          >
            FAQ
          </button>
        </div>
        {activeTab == "check" && (
          <>
            {/* ---------- The actual input box the user types into ---------- */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a password..."
                className="w-full rounded-xl bg-zinc-100 px-5 py-4 text-lg
               text-zinc-800 placeholder-zinc-400 outline-none
               focus:ring-2 focus:ring-zinc-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-sm text-zinc-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

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
            {/* Breach check result */}
            <div className="mt-4">
              {checkingBreach && (
                <p className="text-zinc-500">Checking breach history...</p>
              )}
              {!checkingBreach && breachCount !== null && breachCount > 0 && (
                <p className="text-red-700">
                  This password has appeared in {breachCount.toLocaleString()}{" "}
                  known data breaches. It&apos;s best to avoid using it.
                </p>
              )}
              {!checkingBreach && breachCount === 0 && (
                <p className="text-green-700">
                  Good news — this password hasn&apos;t appeared in any
                  known data breaches.
                </p>
              )}
            </div>

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
          </>
        )}
        {activeTab === "examples" && (
          <div className="space-y-3">
            <p className="text-zinc-600 px-5 pb-4">
              Strong passwords come in a few shapes. Here are real examples - click one to see why it works
            </p>

            <div className="bg-zinc-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenExample(openExample === 0 ? null : 0)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <span className="font-mono text-zinc-800">correct-horse-battery-staple</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Passphrase
                  </span>
                  <span className={`text-zinc-400 transition-transform ${openExample === 0 ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </div>
              </button>

              {openExample === 0 && (
                <p className="text-zinc-600 px-5 pb-4">
                  Four random words joined together. Easy to remember, very hard to
                  guess — length is the real power here.
                </p>
              )}
            </div>

            <div className="bg-zinc-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenExample(openExample === 1 ? null : 1)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <span className="font-mono text-zinc-800">Mango$Tree!92&Desk</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Mixed
                  </span>
                  <span className={`text-zinc-400 transition-transform ${openExample === 1 ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </div>
              </button>

              {openExample === 1 && (
                <p className="text-zinc-600 px-5 pb-4">
                  A mix of unrelated words with numbers and symbols in between. No
                  personal info, no dictionary phrase.
                </p>
              )}
            </div>
            <div className="bg-zinc-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenExample(openExample === 2 ? null : 2)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <span className="font-mono text-zinc-800">purple-lamp-ocean-97</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Passphrase
                  </span>
                  <span className={`text-zinc-400 transition-transform ${openExample === 2 ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </div>
              </button>

              {openExample === 2 && (
                <p className="text-zinc-600 px-5 pb-4">
                  Three vivid, unconnected words plus a number. Simple to type, surprisingly strong.
                </p>
              )}
            </div>
            <div className="bg-zinc-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenExample(openExample === 3 ? null : 3)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <span className="font-mono text-zinc-800">J!rzQ8#mLp2@vX</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Random
                  </span>
                  <span className={`text-zinc-400 transition-transform ${openExample === 2 ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </div>
              </button>

              {openExample === 3 && (
                <p className="text-zinc-600 px-5 pb-4">
                  Fully random characters. Harder to remember without a password manager, but hard to guess.
                </p>
              )}
            </div>
            <div className="bg-zinc-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenExample(openExample === 4 ? null : 4)}
                className="w-full flex items-center justify-between px-5 py-4"
              >
                <span className="font-mono text-zinc-800">umbrella-fox-17-CLOUD</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Mixed
                  </span>
                  <span className={`text-zinc-400 transition-transform ${openExample === 2 ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </div>
              </button>

              {openExample === 4 && (
                <p className="text-zinc-600 px-5 pb-4">
                  Mixed case, numbers, and three random words. A good balance of strength and memorability.
                </p>
              )}
            </div>
            <p className="text-zinc-600 px-5 pb-4">
              Tip - a password manager can generate and remember strong passwords like these for you automatically.
            </p>
          </div>
        )}


        {activeTab === "HowItWorks" && (
          <div className="space-y-8">
            <p className="text-zinc-600">
              We know handing over a password, even to a tool meant to help, can
              feel uncomfortable. Here&apos;s exactly what happens when you use this, in plain English.
            </p>

            <div>
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 mb-2">
                💻 Everything stays on your device
              </h3>
              <p className="text-zinc-600">
                When you type a password here, it never leaves your phone or computer. The strength check happens entirely inside your browser, the same way a calculator works without phoning home.
                Nothing is sent to us, nothing is stored anywhere, and the moment you close this page, it&apos;s gone.
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 mb-2">
                🔍 How the strength check works
              </h3>
              <p className="text-zinc-600">
                As you type, the tool looks at things like how long your password is, whether it uses a mix
                of letters and numbers, and whether it matches common patterns - like using your name, a birthday, or a word from the dictonary.
                It then gives you honest feedback about what could make it stronger.
              </p>
              <p className="text-zinc-600 mt-3">
                Think of it like a knowledgable friend reading over your shoulder - except they immediately forgot what they saw.
              </p>
            </div>

            <div>
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 mb-2">
                🕵️ The data leak check - and why it's safe
              </h3>
              <p className="text-zinc-600">
                You might wonder: if we're checking whether your password has appeared in a data leak,
                doesn't that mean we have to send your passwor somewhere?
              </p>
              <p className="text-zinc-600 mt-3">
                The clever answer is no. Here&apos;s the trick: instead of sending your actual password, we turn it into a short, scrambled code - like a fingerprint.
                Then we only send the <em>first tiny fragment</em> of that fingerprint to a public database of known leaks.
              </p>
              <p className="text-zinc-600 mt-3">
                The database sends back a list of possibilities, and your device quietly checks whether your fingerprints is on that list - without the database ever knowing wht you typed. Your actual password never goes anywhere.
              </p>
            </div>
            <div className="bg-zinc-100 rounded-xl px-5 py-4 mt-4">
              <p className="italic text-zinc-600">
                Imagine posting a letter with the first line torn off. The post
                office can sort it, but they can&apos;t read it.
              </p>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 mb-2">
              🗄️ What a data leak actually is
              </h3>
              < p className="text-zinc-600">
                A "data leak" or "data breach" happens when a company&apos;s database gets stolen by hackers and the contents get shared or sold online.
                This has happened to thousands of companies - big ones you&apos;d recognise
              </p>
              <p className="text-zinc-600 mt-3">
                If your password was in one of these stolen databases, it ends up on lists that attackers use to try to break into accounts. A password that&apos;s already on those lists
                is much easier to guess than one that isn&apos;t - which is why we flag it.
              </p>
              <p className="text-zinc-600 mt-3">
                Finding out your pasword appeared in a breach doesn&apos;t mean your accounts have been hacked. It just means that particular password is now on those lists,
                and it&apos;s worth choosing a new one.
              </p>
            </div>
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-zinc-900 mb-2">
              ❓ Why we built this
              </h3>
              <p className="text-zinc-600">
                Most password tools show you a red or green bar and leavesyou to figure out the rest. We built this for people who want to understand - not just be told - whether their passwrod is safe.
              </p>
              <p className="text-zinc-600 mt-3">
                There&apos;s nothing wrong with not knowing this stuff alread.
                It&apos;s not taught anywhere. We just think everyone deservces a straight, honest answer.
              </p>
            </div>
          </div>
        )}

        {activeTab === "faq" && (
          <p className="text-zinc-600">FAQ tab coming soon.</p>
        )}

      </div>
    </div>
  );
}






