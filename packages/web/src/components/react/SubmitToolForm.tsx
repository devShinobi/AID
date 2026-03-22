import { useState } from "react";
import { SubmissionSchema } from "@aid/shared/validators";
import { PRICING_TYPE_LABELS, PRICING_TYPES } from "@aid/shared/constants";
import type { SubmissionInput } from "@aid/shared/validators";
import type { Group } from "@aid/shared/types";

interface Props {
  groups: Group[];
}

type FormState = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM: SubmissionInput = {
  name: "",
  tagline: "",
  description: "",
  website_url: "",
  logo_url: null,
  pricing_type: "free",
  pricing_detail: null,
  category_ids: [],
  tags: [],
  submitter_name: "",
  submitter_email: "",
};

export default function SubmitToolForm({ groups }: Props) {
  const [form, setForm] = useState<SubmissionInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof SubmissionInput, string>>>({});
  const [state, setState] = useState<FormState>("idle");
  const [tagInput, setTagInput] = useState("");

  function updateField<K extends keyof SubmissionInput>(
    key: K,
    value: SubmissionInput[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(id)
        ? prev.category_ids.filter((c) => c !== id)
        : [...prev.category_ids, id],
    }));
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || form.tags.includes(tag)) return;
    setForm((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = SubmissionSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof SubmissionInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setState("submitting");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Submission failed");
      }
      setState("success");
    } catch (err) {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-10 text-center">
        <div className="text-4xl">🎉</div>
        <h2 className="mt-3 text-xl font-semibold text-green-800">Submission received!</h2>
        <p className="mt-2 text-sm text-green-700">
          Thanks for contributing. We'll review it shortly.
        </p>
        <button
          onClick={() => { setForm(EMPTY_FORM); setState("idle"); }}
          className="mt-6 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {state === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Something went wrong. Please try again.
        </div>
      )}

      {/* Tool info */}
      <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-gray-700">Tool Information</legend>

        <Field label="Tool name *" error={errors.name}>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g. ChatGPT"
            className={inputClass(!!errors.name)}
          />
        </Field>

        <Field label="Tagline *" error={errors.tagline}>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => updateField("tagline", e.target.value)}
            placeholder="One-line description"
            className={inputClass(!!errors.tagline)}
          />
        </Field>

        <Field label="Description *" error={errors.description}>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Describe what the tool does and who it's for"
            className={inputClass(!!errors.description)}
          />
        </Field>

        <Field label="Website URL *" error={errors.website_url}>
          <input
            type="url"
            value={form.website_url}
            onChange={(e) => updateField("website_url", e.target.value)}
            placeholder="https://example.com"
            className={inputClass(!!errors.website_url)}
          />
        </Field>

        <Field label="Logo URL" error={errors.logo_url}>
          <input
            type="url"
            value={form.logo_url ?? ""}
            onChange={(e) => updateField("logo_url", e.target.value || null)}
            placeholder="https://example.com/logo.png (optional)"
            className={inputClass(!!errors.logo_url)}
          />
        </Field>
      </fieldset>

      {/* Pricing */}
      <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-gray-700">Pricing</legend>

        <Field label="Pricing type *" error={errors.pricing_type}>
          <select
            value={form.pricing_type}
            onChange={(e) => updateField("pricing_type", e.target.value as any)}
            className={inputClass(!!errors.pricing_type)}
          >
            {PRICING_TYPES.map((pt) => (
              <option key={pt} value={pt}>{PRICING_TYPE_LABELS[pt]}</option>
            ))}
          </select>
        </Field>

        <Field label="Pricing detail" error={errors.pricing_detail}>
          <input
            type="text"
            value={form.pricing_detail ?? ""}
            onChange={(e) => updateField("pricing_detail", e.target.value || null)}
            placeholder="e.g. Free up to 10 users, $20/mo for teams (optional)"
            className={inputClass(!!errors.pricing_detail)}
          />
        </Field>
      </fieldset>

      {/* Categories */}
      {groups.length > 0 && (
        <fieldset className="rounded-xl border border-gray-200 bg-white p-5">
          <legend className="mb-3 px-1 text-sm font-semibold text-gray-700">Categories</legend>
          <div className="flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => toggleCategory(g.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  form.category_ids.includes(g.id)
                    ? "bg-indigo-600 text-white"
                    : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Tags */}
      <fieldset className="rounded-xl border border-gray-200 bg-white p-5">
        <legend className="mb-3 px-1 text-sm font-semibold text-gray-700">Tags</legend>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder="Type a tag and press Enter"
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={addTag}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Add
          </button>
        </div>
        {form.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-700">
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </fieldset>

      {/* Submitter */}
      <fieldset className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        <legend className="px-1 text-sm font-semibold text-gray-700">About You</legend>

        <Field label="Your name *" error={errors.submitter_name}>
          <input
            type="text"
            value={form.submitter_name}
            onChange={(e) => updateField("submitter_name", e.target.value)}
            placeholder="Jane Doe"
            className={inputClass(!!errors.submitter_name)}
          />
        </Field>

        <Field label="Your email *" error={errors.submitter_email}>
          <input
            type="email"
            value={form.submitter_email}
            onChange={(e) => updateField("submitter_email", e.target.value)}
            placeholder="jane@example.com"
            className={inputClass(!!errors.submitter_email)}
          />
        </Field>
      </fieldset>

      <button
        type="submit"
        disabled={state === "submitting"}
        className="w-full rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
      >
        {state === "submitting" ? "Submitting…" : "Submit Tool"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    "w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-red-500"
      : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500",
  ].join(" ");
}
