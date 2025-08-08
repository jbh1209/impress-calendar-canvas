import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { upsertPitchPrintProject } from "@/services/pitchprintProjectService";

const PitchPrintCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const projectId = params.get("project_id") || params.get("project") || "";
    const productId = params.get("product_id") || params.get("product") || "";
    const previewUrl = params.get("preview_url") || undefined;

    if (!projectId || !productId) {
      toast.error("Missing project or product reference from PitchPrint");
      navigate("/", { replace: true });
      return;
    }

    (async () => {
      const { ok } = await upsertPitchPrintProject({
        projectId,
        productId,
        status: "completed",
        previewUrl,
      });
      if (ok) {
        toast.success("Design saved! You can add it to your cart.");
      } else {
        toast.error("Couldn't save your design. Please try again.");
      }
      navigate("/", { replace: true });
    })();
  }, [location.search, navigate]);

  return null;
};

export default PitchPrintCallback;
