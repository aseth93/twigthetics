import { promises as fs } from "fs";
import path from "path";
import { getGuidePurchaseForMember } from "@/lib/guide/access";
import { GUIDE_FILE_NAME } from "@/lib/guide/constants";
import { createLicensedGuidePdf } from "@/lib/guide/pdf";
import { getPortalViewer } from "@/lib/portal/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const viewer = await getPortalViewer();

  if (!viewer || viewer.profile.role !== "member") {
    return Response.json({ error: "Sign in to access this guide." }, { status: 401 });
  }

  const purchase = await getGuidePurchaseForMember(viewer.profile.id);

  if (!purchase) {
    return Response.json(
      { error: "This account does not have access to the guide." },
      { status: 403 },
    );
  }

  try {
    const sourcePath = path.join(process.cwd(), "output", "pdf", GUIDE_FILE_NAME);
    const sourceBytes = await fs.readFile(sourcePath);
    const licensedPdf = await createLicensedGuidePdf(sourceBytes, {
      email: viewer.profile.email,
      orderReference: purchase.stripeCheckoutSessionId,
    });

    return new Response(new Uint8Array(licensedPdf), {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Disposition":
          'inline; filename="twigthetics-lean-athletic-physique-guide.pdf"',
        "Content-Type": "application/pdf",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return Response.json(
      { error: "The guide could not be prepared right now." },
      { status: 500 },
    );
  }
}
