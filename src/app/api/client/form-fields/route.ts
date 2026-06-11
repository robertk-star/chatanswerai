import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clientCookieName, verifyClientSessionToken } from "@/lib/clientAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const FIELD_TYPES = new Set(["text", "textarea", "email", "phone", "number", "date", "select", "yes_no"]);

const starterFields = [
  ["name", "Name", "text", "Your name", "", true, true, 10, true],
  ["email", "Email", "email", "you@example.com", "", true, false, 20, true],
  ["phone", "Phone", "phone", "Best phone number", "", true, true, 30, true],
  ["company", "Company", "text", "Company name", "", true, false, 40, true],
  ["job_title", "Job Title", "text", "Your role or title", "", false, false, 50, false],
  ["preferred_contact_method", "Preferred Contact Method", "select", "", "Phone\nEmail\nText", false, false, 60, false],
  ["best_time_to_contact", "Best Time to Contact", "text", "Morning, afternoon, evening", "", false, false, 70, false],
  ["service_needed", "Service Needed", "text", "Tell us what you need help with", "", true, false, 80, true],
  ["message", "Message / Notes", "textarea", "Share any details that may help the team respond", "", true, false, 90, true],
  ["preferred_timeline", "Preferred Timeline", "select", "", "ASAP\nThis week\nWithin 30 days\n1–3 months\nJust researching", true, false, 100, true],
  ["urgency", "Urgency", "select", "", "Low\nMedium\nHigh\nEmergency", false, false, 110, false],
  ["budget_range", "Budget Range", "select", "", "$0–$500\n$500–$1,000\n$1,000–$5,000\n$5,000+\nNot sure", false, false, 120, false],
  ["project_type", "Project Type", "text", "Type of project or request", "", false, false, 130, false],
  ["current_problem", "Current Problem", "textarea", "What problem are you trying to solve?", "", false, false, 140, false],
  ["issue_length", "How Long Has This Been an Issue?", "text", "Example: 2 weeks, 3 months", "", false, false, 150, false],
  ["street_address", "Street Address", "text", "Service street address", "", false, false, 160, false],
  ["city", "City", "text", "City", "", false, false, 170, false],
  ["state", "State", "text", "State", "", false, false, 180, false],
  ["zip_code", "ZIP Code", "text", "ZIP code", "", false, false, 190, false],
  ["service_location", "Service Location", "text", "Where is service needed?", "", false, false, 200, false],
  ["residential_or_commercial", "Residential or Commercial", "select", "", "Residential\nCommercial", false, false, 210, false],
  ["company_size", "Company Size", "select", "", "1–10\n11–50\n51–200\n201–500\n500+", false, false, 220, false],
  ["industry", "Industry", "text", "Industry", "", false, false, 230, false],
  ["number_of_employees", "Number of Employees", "number", "Employee count", "", false, false, 240, false],
  ["current_provider", "Current Provider / Vendor", "text", "Current provider, if any", "", false, false, 250, false],
  ["decision_maker_name", "Decision Maker Name", "text", "Decision maker name", "", false, false, 260, false],
  ["is_decision_maker", "Are You the Decision Maker?", "yes_no", "", "", false, false, 270, false],
  ["estimated_monthly_need", "Estimated Monthly Need", "text", "Estimated monthly volume or need", "", false, false, 280, false],
  ["appointment_date", "Preferred Appointment Date", "date", "", "", false, false, 290, false],
  ["appointment_time", "Preferred Appointment Time", "text", "Preferred time", "", false, false, 300, false],
  ["in_person_or_virtual", "In-Person or Virtual", "select", "", "In-person\nVirtual\nEither", false, false, 310, false],
  ["location_preference", "Location Preference", "text", "Location preference", "", false, false, 320, false],
  ["ready_to_move_forward", "Ready to Move Forward?", "yes_no", "", "", false, false, 330, false],
  ["needed_completion_date", "When Do You Need This Completed?", "text", "Target date or timeframe", "", false, false, 340, false],
  ["worked_with_provider", "Worked With Another Provider?", "yes_no", "", "", false, false, 350, false],
  ["biggest_concern", "Biggest Concern", "textarea", "What is your biggest concern?", "", false, false, 360, false],
  ["how_heard", "How Did You Hear About Us?", "select", "", "Google\nFacebook\nReferral\nFriend or family\nOther", false, false, 370, false],
  ["property_type", "Property Type", "select", "", "House\nCondo\nTownhome\nCommercial\nLand\nOther", false, false, 380, false],
  ["emergency_request", "Emergency Request", "yes_no", "", "", false, false, 390, false],
  ["case_type", "Case Type", "text", "Case type", "", false, false, 400, false],
  ["date_of_incident", "Date of Incident", "date", "", "", false, false, 410, false],
  ["current_status", "Current Status", "text", "Current status", "", false, false, 420, false],
  ["vehicle_year", "Vehicle Year", "text", "Year", "", false, false, 430, false],
  ["vehicle_make", "Vehicle Make", "text", "Make", "", false, false, 440, false],
  ["vehicle_model", "Vehicle Model", "text", "Model", "", false, false, 450, false],
  ["mileage", "Mileage", "text", "Mileage", "", false, false, 460, false],
  ["vin", "VIN", "text", "VIN", "", false, false, 470, false],
  ["treatment_interested_in", "Treatment Interested In", "text", "Treatment or service", "", false, false, 480, false],
  ["new_or_returning_patient", "New or Returning Patient", "select", "", "New patient\nReturning patient", false, false, 490, false],
];

function value(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

function redirectWithMessage(request: Request, kind: "saved" | "error", message: string) {
  const url = new URL("/client/form-builder", request.url);
  url.searchParams.set(kind, message);
  return NextResponse.redirect(url, { status: 303 });
}

async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(clientCookieName())?.value;
  return verifyClientSessionToken(token);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/client/login", request.url), { status: 303 });

  const supabase = getSupabaseAdmin();
  if (!supabase) return redirectWithMessage(request, "error", "Supabase is not configured.");
  if (!session.businessId) return redirectWithMessage(request, "error", "Client account is not attached to a business.");

  const formData = await request.formData();
  const action = value(formData, "action");
  const now = new Date().toISOString();

  if (action === "seed") {
    const rows = starterFields.map(([field_key, label, field_type, placeholder, options, is_enabled, is_required, sort_order, is_system]) => ({
      business_id: session.businessId,
      field_key,
      label,
      field_type,
      placeholder,
      options,
      is_enabled,
      is_required,
      sort_order,
      is_system,
      updated_at: now,
    }));

    const { error } = await supabase
      .from("widget_form_fields")
      .upsert(rows, { onConflict: "business_id,field_key" });

    if (error) return redirectWithMessage(request, "error", error.message);
    return redirectWithMessage(request, "saved", "Field library loaded.");
  }

  if (action === "create") {
    const label = value(formData, "label");
    const fieldType = value(formData, "field_type") || "text";
    if (!label) return redirectWithMessage(request, "error", "Field label is required.");
    if (!FIELD_TYPES.has(fieldType)) return redirectWithMessage(request, "error", "Invalid field type.");

    const fieldKey = slugify(value(formData, "field_key") || label);
    if (!fieldKey) return redirectWithMessage(request, "error", "Field key is required.");

    const sortOrder = Number(value(formData, "sort_order") || "999") || 999;
    const { error } = await supabase.from("widget_form_fields").insert({
      business_id: session.businessId,
      field_key: fieldKey,
      label,
      field_type: fieldType,
      placeholder: value(formData, "placeholder"),
      options: value(formData, "options"),
      is_enabled: checked(formData, "is_enabled"),
      is_required: checked(formData, "is_required"),
      sort_order: sortOrder,
      is_system: false,
      updated_at: now,
    });

    if (error) return redirectWithMessage(request, "error", error.message);
    return redirectWithMessage(request, "saved", "Field added.");
  }

  if (action === "update") {
    const id = value(formData, "id");
    const label = value(formData, "label");
    const fieldType = value(formData, "field_type") || "text";
    if (!id || !label) return redirectWithMessage(request, "error", "Field and label are required.");
    if (!FIELD_TYPES.has(fieldType)) return redirectWithMessage(request, "error", "Invalid field type.");

    const sortOrder = Number(value(formData, "sort_order") || "0") || 0;
    const { error } = await supabase
      .from("widget_form_fields")
      .update({
        label,
        field_type: fieldType,
        placeholder: value(formData, "placeholder"),
        options: value(formData, "options"),
        is_enabled: checked(formData, "is_enabled"),
        is_required: checked(formData, "is_required"),
        sort_order: sortOrder,
        updated_at: now,
      })
      .eq("id", id)
      .eq("business_id", session.businessId);

    if (error) return redirectWithMessage(request, "error", error.message);
    return redirectWithMessage(request, "saved", "Field updated.");
  }

  if (action === "delete") {
    const id = value(formData, "id");
    if (!id) return redirectWithMessage(request, "error", "Field is required.");

    const { error } = await supabase
      .from("widget_form_fields")
      .delete()
      .eq("id", id)
      .eq("business_id", session.businessId);

    if (error) return redirectWithMessage(request, "error", error.message);
    return redirectWithMessage(request, "saved", "Field deleted.");
  }

  return redirectWithMessage(request, "error", "Unknown action.");
}
