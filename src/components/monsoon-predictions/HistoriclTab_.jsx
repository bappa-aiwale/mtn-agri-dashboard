import Image from "next/image";
import { useState } from "react";

function HistoricalTab() {
  const [activeFigure, setActiveFigure] = useState("fig1");

  const figures = {
    fig1: {
      src: "/results/fig_2_comic_neue_index_by_year_color_bars.png",
      alt: "Fig 2: Monthly Average Rainfall during Monsoon",
      isPriority: true,
      label: "Monsoon",
    },
    fig2: {
      src: "/results/fig_1_comic_neue_index_by_year_color_bars.png",
      alt: "Fig 1: Monthly Average Rainfall (All Year)",
      isPriority: true,
      label: "All Year",
    },
  };

  const FigureButton = ({ id }) => (
    <button
      className={`w-full shadow-lg px-4 py-2 rounded-lg font-medium transition-colors ${
        activeFigure === id
          ? "bg-mtn-green-800 text-white"
          : " text-gray-700 hover:bg-green-100"
      }`}
      onClick={() => setActiveFigure(id)}
      aria-pressed={activeFigure === id}
    >
      {figures[id].label}
    </button>
  );

  const currentFigure = figures[activeFigure];

  return (
    <div className="mt-4 text-mtn-green-800">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <FigureButton id="fig1" />
        <FigureButton id="fig2" />
      </div>
      <div className="w-auto flex justify-center h-[70vh]">
        <Image
          src={currentFigure.src}
          alt={currentFigure.alt}
          width={1100}
          height={500}
          priority={currentFigure.isPriority}
        />
      </div>
    </div>
  );
}

export default HistoricalTab;
