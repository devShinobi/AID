/**
 * seed.ts
 *
 * Inserts sample data into AID collections for local development.
 * Safe to run multiple times — checks for existing records first.
 *
 * Usage:
 *   pnpm --filter @aid/scripts seed
 */

import {
  createDirectus,
  rest,
  authentication,
  createItem,
  readItems,
} from "@directus/sdk";

const DIRECTUS_URL = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const ADMIN_EMAIL = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.DIRECTUS_ADMIN_PASSWORD ?? "admin123";

async function main() {
  console.log(`\n🌱 Seeding AID data at ${DIRECTUS_URL}…`);

  const client = createDirectus(DIRECTUS_URL)
    .with(authentication("json"))
    .with(rest());

  await client.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  console.log("✅ Authenticated\n");

  // ── Groups ──────────────────────────────────────────────────────────────────
  const existingGroups: any[] = await client.request(readItems("groups" as any, { limit: 1 }));
  if (existingGroups.length > 0) {
    console.log("⏭️  Groups already seeded — skipping");
  } else {
    const groups = await Promise.all([
      client.request(createItem("groups" as any, { name: "Writing", slug: "writing", function: "AI-powered writing and content creation tools" })),
      client.request(createItem("groups" as any, { name: "Image Generation", slug: "image-generation", function: "Generate and edit images using AI" })),
      client.request(createItem("groups" as any, { name: "Code", slug: "code", function: "AI coding assistants and developer tools" })),
      client.request(createItem("groups" as any, { name: "Productivity", slug: "productivity", function: "AI tools to boost personal and team productivity" })),
      client.request(createItem("groups" as any, { name: "Chat & Assistants", slug: "chat-assistants", function: "Conversational AI and general-purpose assistants" })),
    ]);
    console.log(`✅ Created ${groups.length} groups`);
  }

  // Fetch groups for relations
  const allGroups: any[] = await client.request(readItems("groups" as any, { limit: -1 }));
  const groupBySlug = Object.fromEntries(allGroups.map((g: any) => [g.slug, g.id]));

  // ── Tools ───────────────────────────────────────────────────────────────────
  const existingTools: any[] = await client.request(readItems("tools" as any, { limit: 1 }));
  if (existingTools.length > 0) {
    console.log("⏭️  Tools already seeded — skipping");
  } else {
    const toolDefs = [
      {
        tool: {
          name: "ChatGPT",
          slug: "chatgpt",
          overview: "ChatGPT is a conversational AI assistant by OpenAI. It can answer questions, write code, draft emails, summarise documents, and much more. Available via web, mobile apps, and API.",
          website_url: "https://chat.openai.com",
          logo_url: "https://logo.clearbit.com/openai.com",
          pricing_type: "freemium",
          pricing_min: 20,
          pricing_max: null,
          pricing_label: "Free + $20/mo Pro",
          pros: ["Extremely capable across many tasks", "Large context window", "Plugin ecosystem"],
          cons: ["Can hallucinate facts", "Free tier has rate limits"],
          is_featured: true,
          status: "published",
        },
        groups: ["chat-assistants", "writing", "code"],
      },
      {
        tool: {
          name: "Midjourney",
          slug: "midjourney",
          overview: "Midjourney is an AI image generation tool accessible via Discord and web. It produces high-quality artistic images from text prompts and is widely used by designers and creators.",
          website_url: "https://www.midjourney.com",
          logo_url: "https://logo.clearbit.com/midjourney.com",
          pricing_type: "paid",
          pricing_min: 10,
          pricing_max: 60,
          pricing_label: null,
          pros: ["Stunning artistic quality", "Active community", "Consistent style control"],
          cons: ["No free tier", "Discord-centric workflow"],
          is_featured: true,
          status: "published",
        },
        groups: ["image-generation"],
      },
      {
        tool: {
          name: "GitHub Copilot",
          slug: "github-copilot",
          overview: "GitHub Copilot is an AI pair programmer that suggests code completions in your editor. It supports dozens of languages and integrates with VS Code, JetBrains, Neovim, and more.",
          website_url: "https://github.com/features/copilot",
          logo_url: "https://logo.clearbit.com/github.com",
          pricing_type: "freemium",
          pricing_min: 10,
          pricing_max: null,
          pricing_label: "Free for students + $10/mo",
          pros: ["Deep IDE integration", "Fast inline suggestions", "Free for students/OSS"],
          cons: ["Suggestions can be insecure", "Requires internet"],
          is_featured: true,
          status: "published",
        },
        groups: ["code"],
      },
      {
        tool: {
          name: "Notion AI",
          slug: "notion-ai",
          overview: "Notion AI brings AI writing and summarisation capabilities directly into Notion workspaces. Summarise pages, generate content, translate text, and extract action items without leaving your notes.",
          website_url: "https://www.notion.so/product/ai",
          logo_url: "https://logo.clearbit.com/notion.so",
          pricing_type: "freemium",
          pricing_min: 8,
          pricing_max: null,
          pricing_label: "$8/mo add-on",
          pros: ["Seamless Notion integration", "Great for summarisation", "Easy to use"],
          cons: ["Only useful inside Notion", "Add-on cost on top of Notion subscription"],
          is_featured: false,
          status: "published",
        },
        groups: ["writing", "productivity"],
      },
      {
        tool: {
          name: "Claude",
          slug: "claude",
          overview: "Claude is an AI assistant by Anthropic focused on helpfulness, harmlessness, and honesty. It excels at long-document analysis, coding, and nuanced reasoning with a very large context window.",
          website_url: "https://claude.ai",
          logo_url: "https://logo.clearbit.com/anthropic.com",
          pricing_type: "freemium",
          pricing_min: 20,
          pricing_max: null,
          pricing_label: "Free + $20/mo Pro",
          pros: ["Huge context window (200k tokens)", "Excellent at long documents", "Thoughtful, nuanced responses"],
          cons: ["Slower than some competitors on simple tasks"],
          is_featured: true,
          status: "published",
        },
        groups: ["chat-assistants", "writing", "code"],
      },
      {
        tool: {
          name: "Stable Diffusion",
          slug: "stable-diffusion",
          overview: "Stable Diffusion is an open-source AI image generation model that can be run locally or via hosted services. It offers fine-grained control through LoRA models, ControlNet, and custom checkpoints.",
          website_url: "https://stability.ai",
          logo_url: "https://logo.clearbit.com/stability.ai",
          pricing_type: "open_source",
          pricing_min: null,
          pricing_max: null,
          pricing_label: "Free (self-hosted)",
          pros: ["Completely free to run locally", "Highly customisable", "Large model ecosystem"],
          cons: ["Requires technical knowledge to set up", "GPU needed for best performance"],
          is_featured: true,
          status: "published",
        },
        groups: ["image-generation"],
      },
    ];

    for (const { tool, groups } of toolDefs) {
      const created: any = await client.request(createItem("tools" as any, tool));

      // Create tool_groups junction records
      for (const slug of groups) {
        const groupId = groupBySlug[slug];
        if (groupId) {
          await client.request(
            createItem("tool_groups" as any, { tool_id: created.id, group_id: groupId })
          );
        }
      }
      console.log(`✅ Created tool: ${tool.name}`);
    }
  }

  // ── News ────────────────────────────────────────────────────────────────────
  const existingNews: any[] = await client.request(readItems("news" as any, { limit: 1 }));
  if (existingNews.length > 0) {
    console.log("⏭️  News already seeded — skipping");
  } else {
    const allTools: any[] = await client.request(readItems("tools" as any, { limit: -1, fields: ["id", "slug"] }));
    const toolBySlug = Object.fromEntries(allTools.map((t: any) => [t.slug, t.id]));

    const newsItems = [
      {
        tool_id: toolBySlug["chatgpt"],
        title: "OpenAI releases GPT-4o with improved voice and vision",
        content: "OpenAI has launched GPT-4o, a new flagship model that integrates text, audio, and image understanding into a single model. The update brings significantly faster response times and improved multilingual support.",
        source_name: "OpenAI Blog",
        source_type: "manual",
        published_at: "2024-05-13T10:00:00Z",
      },
      {
        tool_id: toolBySlug["midjourney"],
        title: "Midjourney v6.1 improves text rendering and realism",
        content: "Midjourney's latest model update focuses on dramatically improved text rendering within images, better photorealism, and more consistent character generation across multiple prompts.",
        source_name: "Midjourney",
        source_type: "manual",
        published_at: "2024-07-30T08:00:00Z",
      },
      {
        tool_id: toolBySlug["claude"],
        title: "Anthropic launches Claude 3.5 Sonnet with computer use",
        content: "Anthropic's Claude 3.5 Sonnet introduces computer use capabilities, allowing the model to interact with desktop applications, browsers, and files directly — opening new agentic workflow possibilities.",
        source_name: "Anthropic Blog",
        source_type: "manual",
        published_at: "2024-10-22T12:00:00Z",
      },
      {
        tool_id: toolBySlug["github-copilot"],
        title: "GitHub Copilot gets multi-file editing and agent mode",
        content: "GitHub has expanded Copilot with agent mode, enabling it to autonomously edit multiple files, run tests, and fix errors in a loop. The feature is rolling out in VS Code and JetBrains IDEs.",
        source_name: "GitHub Blog",
        source_type: "manual",
        published_at: "2025-02-06T10:00:00Z",
      },
      {
        tool_id: toolBySlug["stable-diffusion"],
        title: "Stability AI releases Stable Diffusion 3.5 with improved prompt adherence",
        content: "Stability AI has launched Stable Diffusion 3.5, a major update featuring improved prompt adherence, better text rendering, and a new Large Turbo variant that runs significantly faster for real-time workflows.",
        source_name: "Stability AI Blog",
        source_type: "manual",
        published_at: "2024-10-29T09:00:00Z",
      },
      {
        tool_id: toolBySlug["notion-ai"],
        title: "Notion AI adds Q&A across your entire workspace",
        content: "Notion AI's new Q&A feature lets users ask natural language questions and receive answers synthesised from across their entire workspace, including databases, docs, and meeting notes.",
        source_name: "Notion Blog",
        source_type: "manual",
        published_at: "2024-01-18T08:00:00Z",
      },
    ];

    for (const item of newsItems) {
      if (!item.tool_id) continue;
      await client.request(createItem("news" as any, item));
      console.log(`✅ Created news: ${item.title?.slice(0, 50)}…`);
    }
  }

  // ── Shared tool lookup ───────────────────────────────────────────────────────
  const allTools: any[] = await client.request(readItems("tools" as any, { limit: -1, fields: ["id", "slug"] }));
  const toolBySlug = Object.fromEntries(allTools.map((t: any) => [t.slug, t.id]));

  // ── Reviews ──────────────────────────────────────────────────────────────────
  const existingReviews: any[] = await client.request(readItems("reviews" as any, { limit: 1 }));
  if (existingReviews.length > 0) {
    console.log("⏭️  Reviews already seeded — skipping");
  } else {
    const reviews = [
      { tool_id: toolBySlug["chatgpt"], review_text: "ChatGPT is my go-to for everything from drafting emails to debugging code. The breadth of tasks it handles is unmatched.", type: "normal" },
      { tool_id: toolBySlug["chatgpt"], review_text: "The GPT-4o model is a significant step forward — multimodal capabilities feel genuinely useful rather than a gimmick.", type: "expert" },
      { tool_id: toolBySlug["claude"], review_text: "Claude's ability to handle 200k-token contexts is a game changer for long document analysis. Summaries are remarkably accurate.", type: "normal" },
      { tool_id: toolBySlug["claude"], review_text: "Anthropic's constitutional AI approach shows — Claude is noticeably more careful and nuanced in its responses compared to competitors.", type: "expert" },
      { tool_id: toolBySlug["midjourney"], review_text: "The artistic quality from Midjourney is simply stunning. No other tool comes close for generating illustrations and concept art.", type: "normal" },
      { tool_id: toolBySlug["midjourney"], review_text: "Midjourney's style consistency across prompts has improved dramatically in v6. You can now maintain character likeness reliably across a whole series.", type: "expert" },
      { tool_id: toolBySlug["github-copilot"], review_text: "Copilot has genuinely made me faster. It autocompletes whole functions correctly and picks up on project-specific patterns quickly.", type: "normal" },
      { tool_id: toolBySlug["github-copilot"], review_text: "The new agent mode is a step change — Copilot can now iterate across files, run tests, and fix failures autonomously. It's closer to a junior dev than an autocomplete.", type: "expert" },
      { tool_id: toolBySlug["stable-diffusion"], review_text: "Running locally means no censorship and no subscription — with the right model and ControlNet setup, the results rival Midjourney.", type: "expert" },
      { tool_id: toolBySlug["stable-diffusion"], review_text: "The open-source ecosystem around SD is incredible — LoRA fine-tunes, embeddings, ControlNet adapters. Once you learn the tooling the creative control is unmatched.", type: "normal" },
      { tool_id: toolBySlug["notion-ai"], review_text: "Notion AI fits seamlessly into my existing workflow. The meeting notes summarisation alone saves me an hour a week.", type: "normal" },
      { tool_id: toolBySlug["notion-ai"], review_text: "The Q&A feature across the whole workspace is genuinely useful — it surfaces relevant notes from months ago that I would never have found manually.", type: "expert" },
    ];
    for (const r of reviews) {
      if (!r.tool_id) continue;
      await client.request(createItem("reviews" as any, r));
    }
    console.log(`✅ Created ${reviews.length} reviews`);
  }

  // ── Alternatives ─────────────────────────────────────────────────────────────
  const existingAlts: any[] = await client.request(readItems("alternatives" as any, { limit: 1 }));
  if (existingAlts.length > 0) {
    console.log("⏭️  Alternatives already seeded — skipping");
  } else {
    const alternatives = [
      { tool_id: toolBySlug["chatgpt"], alt_name: "Claude", alt_url: "https://claude.ai" },
      { tool_id: toolBySlug["chatgpt"], alt_name: "Gemini", alt_url: "https://gemini.google.com" },
      { tool_id: toolBySlug["chatgpt"], alt_name: "Mistral", alt_url: "https://mistral.ai" },
      { tool_id: toolBySlug["claude"], alt_name: "ChatGPT", alt_url: "https://chat.openai.com" },
      { tool_id: toolBySlug["claude"], alt_name: "Gemini", alt_url: "https://gemini.google.com" },
      { tool_id: toolBySlug["midjourney"], alt_name: "Stable Diffusion", alt_url: "https://stability.ai" },
      { tool_id: toolBySlug["midjourney"], alt_name: "DALL-E 3", alt_url: "https://openai.com/dall-e-3" },
      { tool_id: toolBySlug["midjourney"], alt_name: "Adobe Firefly", alt_url: "https://firefly.adobe.com" },
      { tool_id: toolBySlug["stable-diffusion"], alt_name: "Midjourney", alt_url: "https://midjourney.com" },
      { tool_id: toolBySlug["stable-diffusion"], alt_name: "DALL-E 3", alt_url: "https://openai.com/dall-e-3" },
      { tool_id: toolBySlug["github-copilot"], alt_name: "Cursor", alt_url: "https://cursor.sh" },
      { tool_id: toolBySlug["github-copilot"], alt_name: "Tabnine", alt_url: "https://www.tabnine.com" },
      { tool_id: toolBySlug["github-copilot"], alt_name: "Codeium", alt_url: "https://codeium.com" },
      { tool_id: toolBySlug["notion-ai"], alt_name: "Coda AI", alt_url: "https://coda.io" },
      { tool_id: toolBySlug["notion-ai"], alt_name: "Mem", alt_url: "https://mem.ai" },
    ];
    for (const a of alternatives) {
      if (!a.tool_id) continue;
      await client.request(createItem("alternatives" as any, a));
    }
    console.log(`✅ Created ${alternatives.length} alternatives`);
  }

  // ── Tutorials ────────────────────────────────────────────────────────────────
  const existingTutorials: any[] = await client.request(readItems("tutorials" as any, { limit: 1 }));
  if (existingTutorials.length > 0) {
    console.log("⏭️  Tutorials already seeded — skipping");
  } else {
    const tutorials = [
      { tool_id: toolBySlug["chatgpt"], title: "ChatGPT Prompt Engineering Guide", url: "https://platform.openai.com/docs/guides/prompt-engineering", type: "link" },
      { tool_id: toolBySlug["chatgpt"], title: "Getting Started with ChatGPT API", url: "https://platform.openai.com/docs/quickstart", type: "link" },
      { tool_id: toolBySlug["claude"], title: "Claude Prompt Library", url: "https://docs.anthropic.com/en/prompt-library/library", type: "link" },
      { tool_id: toolBySlug["claude"], title: "Anthropic Claude API Quickstart", url: "https://docs.anthropic.com/en/docs/quickstart", type: "link" },
      { tool_id: toolBySlug["midjourney"], title: "Midjourney Quick Start Guide", url: "https://docs.midjourney.com/docs/quick-start", type: "link" },
      { tool_id: toolBySlug["midjourney"], title: "Midjourney Prompt Reference", url: "https://docs.midjourney.com/docs/prompts-2", type: "link" },
      { tool_id: toolBySlug["stable-diffusion"], title: "Stable Diffusion Web UI Installation Guide", url: "https://github.com/AUTOMATIC1111/stable-diffusion-webui#installation-and-running", type: "link" },
      { tool_id: toolBySlug["stable-diffusion"], title: "Beginner's Guide to Stable Diffusion", url: "https://stable-diffusion-art.com/beginners-guide/", type: "link" },
      { tool_id: toolBySlug["github-copilot"], title: "Getting Started with GitHub Copilot", url: "https://docs.github.com/en/copilot/using-github-copilot/getting-started-with-github-copilot", type: "link" },
      { tool_id: toolBySlug["github-copilot"], title: "GitHub Copilot Best Practices", url: "https://docs.github.com/en/copilot/using-github-copilot/best-practices-for-using-github-copilot", type: "link" },
      { tool_id: toolBySlug["notion-ai"], title: "Using Notion AI — Official Guide", url: "https://www.notion.so/help/guides/notion-ai-for-docs", type: "link" },
      { tool_id: toolBySlug["notion-ai"], title: "Notion AI Q&A Walkthrough", url: "https://www.notion.so/help/notion-ai-for-q-and-a", type: "link" },
    ];
    for (const t of tutorials) {
      if (!t.tool_id) continue;
      await client.request(createItem("tutorials" as any, t));
    }
    console.log(`✅ Created ${tutorials.length} tutorials`);
  }

  // ── FAQ ──────────────────────────────────────────────────────────────────────
  const existingFaq: any[] = await client.request(readItems("faq" as any, { limit: 1 }));
  if (existingFaq.length > 0) {
    console.log("⏭️  FAQ already seeded — skipping");
  } else {
    const faqs = [
      { tool_id: toolBySlug["chatgpt"], question: "Is ChatGPT free to use?", answer: "Yes — ChatGPT has a free tier powered by GPT-4o mini. ChatGPT Plus ($20/mo) gives access to GPT-4o, Advanced Data Analysis, image generation, and higher limits.", status: "answered" },
      { tool_id: toolBySlug["chatgpt"], question: "Can ChatGPT browse the internet?", answer: "Yes, ChatGPT Plus and Team plans have web browsing capability. The free tier does not have real-time internet access.", status: "answered" },
      { tool_id: toolBySlug["claude"], question: "What makes Claude different from ChatGPT?", answer: "Claude has a significantly larger context window (up to 200k tokens), tends to be more careful about accuracy, and is often preferred for long document analysis and nuanced writing tasks.", status: "answered" },
      { tool_id: toolBySlug["claude"], question: "Does Claude have an API?", answer: "Yes, Anthropic offers the Claude API through their platform at console.anthropic.com. It supports Claude 3.5 Sonnet and Haiku models.", status: "answered" },
      { tool_id: toolBySlug["midjourney"], question: "Do I need a Discord account to use Midjourney?", answer: "Midjourney now has a web interface at midjourney.com, so Discord is no longer required. However, the community Discord remains active.", status: "answered" },
      { tool_id: toolBySlug["midjourney"], question: "Can I use Midjourney images commercially?", answer: "Yes, paid subscribers can use Midjourney images commercially. Free trial users cannot. Check the current subscription plan details on midjourney.com for the latest licensing terms.", status: "answered" },
      { tool_id: toolBySlug["stable-diffusion"], question: "Do I need a powerful GPU to run Stable Diffusion?", answer: "A GPU with at least 4GB VRAM is recommended for comfortable use. It can run on CPU, but will be very slow. Cloud-based options like Google Colab are available for users without powerful hardware.", status: "answered" },
      { tool_id: toolBySlug["stable-diffusion"], question: "What is the best UI for Stable Diffusion?", answer: "The most popular UIs are AUTOMATIC1111's stable-diffusion-webui and ComfyUI. AUTOMATIC1111 is easier for beginners; ComfyUI offers node-based workflows and is preferred for complex pipelines.", status: "answered" },
      { tool_id: toolBySlug["github-copilot"], question: "Is GitHub Copilot free?", answer: "GitHub Copilot is free for verified students and maintainers of popular open source projects. For others, it is $10/month or $100/year.", status: "answered" },
      { tool_id: toolBySlug["github-copilot"], question: "Which editors does GitHub Copilot support?", answer: "GitHub Copilot supports VS Code, Visual Studio, JetBrains IDEs (IntelliJ, PyCharm, WebStorm, etc.), Neovim, and Azure Data Studio, among others.", status: "answered" },
      { tool_id: toolBySlug["notion-ai"], question: "Is Notion AI included in my Notion subscription?", answer: "No — Notion AI is an add-on that costs $8/member/month (billed annually) on top of any Notion plan, including the free plan.", status: "answered" },
      { tool_id: toolBySlug["notion-ai"], question: "What can Notion AI do that regular Notion cannot?", answer: "Notion AI adds generative writing, text summarisation, translation, action item extraction, tone adjustment, and the Q&A feature that answers questions from across your whole workspace.", status: "answered" },
    ];
    for (const f of faqs) {
      if (!f.tool_id) continue;
      await client.request(createItem("faq" as any, f));
    }
    console.log(`✅ Created ${faqs.length} FAQs`);
  }

  // ── Awards ───────────────────────────────────────────────────────────────────
  const existingAwards: any[] = await client.request(readItems("awards" as any, { limit: 1 }));
  if (existingAwards.length > 0) {
    console.log("⏭️  Awards already seeded — skipping");
  } else {
    const awardDefs = [
      { name: "Editor's Choice", description: "Awarded to tools that stand out for quality, innovation, and usefulness.", icon_url: null, year: 2024 },
      { name: "Most Popular", description: "Given to tools with the highest community engagement and usage.", icon_url: null, year: 2024 },
      { name: "Best Free Tool", description: "Recognises the highest-quality tool available at no cost.", icon_url: null, year: 2024 },
      { name: "Best for Developers", description: "Top-rated tool for software engineering workflows.", icon_url: null, year: 2024 },
      { name: "Best Image Generator", description: "Outstanding AI tool for image creation and editing.", icon_url: null, year: 2024 },
      { name: "Best Productivity Tool", description: "Top AI tool for enhancing personal or team productivity.", icon_url: null, year: 2024 },
    ];

    const createdAwards: any[] = [];
    for (const a of awardDefs) {
      const created: any = await client.request(createItem("awards" as any, a));
      createdAwards.push(created);
    }
    console.log(`✅ Created ${createdAwards.length} awards`);

    const awardByName = Object.fromEntries(createdAwards.map((a: any) => [a.name, a.id]));

    const toolAwards = [
      { tool_id: toolBySlug["chatgpt"],         award_id: awardByName["Editor's Choice"],       awarded_at: "2024-12-01T00:00:00Z" },
      { tool_id: toolBySlug["chatgpt"],          award_id: awardByName["Most Popular"],           awarded_at: "2024-12-01T00:00:00Z" },
      { tool_id: toolBySlug["claude"],           award_id: awardByName["Editor's Choice"],       awarded_at: "2024-12-01T00:00:00Z" },
      { tool_id: toolBySlug["stable-diffusion"], award_id: awardByName["Best Free Tool"],         awarded_at: "2024-12-01T00:00:00Z" },
      { tool_id: toolBySlug["stable-diffusion"], award_id: awardByName["Best Image Generator"],   awarded_at: "2024-12-01T00:00:00Z" },
      { tool_id: toolBySlug["midjourney"],       award_id: awardByName["Best Image Generator"],   awarded_at: "2024-12-01T00:00:00Z" },
      { tool_id: toolBySlug["github-copilot"],   award_id: awardByName["Best for Developers"],    awarded_at: "2024-12-01T00:00:00Z" },
      { tool_id: toolBySlug["notion-ai"],        award_id: awardByName["Best Productivity Tool"], awarded_at: "2024-12-01T00:00:00Z" },
    ];

    for (const ta of toolAwards) {
      if (!ta.tool_id || !ta.award_id) continue;
      await client.request(createItem("tool_awards" as any, ta));
    }
    console.log(`✅ Created ${toolAwards.length} tool_awards`);
  }

  console.log("\n🎉 Seeding complete!");
  console.log(`\nVisit ${DIRECTUS_URL.replace("8055", "4321")} to see your site.\n`);
}

main().catch((err) => {
  console.error("\n💥 Seed failed:", err);
  process.exit(1);
});
