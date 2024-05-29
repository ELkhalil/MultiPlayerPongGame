import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./StatusCard.css";
import { PATHS } from "../../constants/paths";

interface StatusCardProps {
  title: string;
  message: string;
}

export default function StatusCard({ title, message }: StatusCardProps) {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      navigate(PATHS.DEFAULT_GAME_PAGE);
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return visible ? (
    <div className="card">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  ) : null;
}
