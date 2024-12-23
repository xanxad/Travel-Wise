import { useNavigate } from "react-router-dom";
import Button from "./Button";

function BackButton() {
  const navigate = useNavigate();
  return (
    <Button
      type="back"
      onClick={(e) => {
        e.preventDefault();
        if (window.history.length > 1) navigate(-1);
        else navigate("/");
      }}
    >
      &larr; Back
    </Button>
  );
}

export default BackButton;
