# Smart-Vet

**AI-Powered Resume & Job Description Analyzer**

[Live Demo](https://smart-vet-weld.vercel.app)

---

## About The Project

Smart-Vet is a full-stack AI hiring platform built to evaluate resumes against job descriptions with configurable precision. Moving beyond a standard API wrapper, Smart-Vet features a robust backend architecture that prioritizes data security, LLM cost efficiency, and granular AI control. It empowers users to understand application gaps while maintaining complete control over their API usage and data privacy.

## Key Engineering Features

* **Configurable Evaluation Engine** : Features a strictness slider in the UI that directly maps to the Gemini API's temperature parameter. This shifts the AI's scoring behavior from lenient to highly critical at request time, without requiring complex prompt rewrites.
* **Bring Your Own Key (BYOK)** : Implemented secure BYOK support via custom request headers. Users inject their own Gemini API key at runtime, granting them full control over their own usage limits and preventing shared-key throttling.
* **Zero-Latency Caching Layer** : Engineered a custom caching system using SHA-256 hashes of the combined resume, job description, and strictness inputs. Repeat analyses bypass the LLM entirely, reducing response latency from 5-8 seconds to near zero and eliminating redundant token costs.
* **Secure Auth & Data Isolation** : Integrated NextAuth.js for seamless Google OAuth. The backend enforces strict, session-scoped data isolation across all API routes, ensuring users can only ever access their own data.

## Tech Stack

**Frontend**
* Next.js, React.js
* Tailwind CSS, Framer Motion

**Backend & Architecture**
* Node.js
* MongoDB, Mongoose
* NextAuth.js (Google OAuth)
* SHA-256 Hashing (Caching Layer)

**AI Integration**
* Google Gemini API (Generative AI)

## How to Use

You can access the tool directly via the [Live Demo](https://smart-vet-weld.vercel.app).

1.  **Authenticate** : Log in securely using Google OAuth to establish your isolated session.
2.  **Configure API & Strictness** : Provide your personal Gemini API key and set the strictness slider to determine how critically the AI should evaluate the resume.
3.  **Input Data** : Paste the target Job Description and upload your Resume text.
4.  **Analyze** : Trigger the evaluation. Identical subsequent requests will return instantly via the caching layer.

## Contact

**Shajid Shahriar**
* Website : [shajidshahriar.codes](https://portfolio-v2-delta-self.vercel.app/#projects)
* Email : shajidsr12@gmail.com
* LinkedIn : [shajid-shahriar](https://linkedin.com/in/shajid-shahriar-194301292)
