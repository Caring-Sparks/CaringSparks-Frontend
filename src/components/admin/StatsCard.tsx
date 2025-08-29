"use client";

import React from "react";
import { IconType } from "react-icons";
import { BsArrowDown, BsArrowUp } from "react-icons/bs";
import { useAdminStats, useAdminStore } from "@/stores/adminStore";

interface StatProps {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ size?: number; className?: string }> | IconType;
  color: string;
}

const StatCard: React.FC<StatProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color,
}) => {
  const isPositive = change > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
          <div
            className={`flex items-center space-x-1 text-sm ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          ></div>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
