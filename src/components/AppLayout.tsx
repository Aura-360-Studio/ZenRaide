import { type ReactNode } from 'react';

interface AppLayoutProps {
  leftColumn: ReactNode;
  centerColumn: ReactNode;
  rightColumn: ReactNode;
}

export function AppLayout({ leftColumn, centerColumn, rightColumn }: AppLayoutProps) {
  return (
    <div className="dashboard-container">
      {/* Speedometer (Center Column) - Placed Left in landscape grid */}
      <div className="dashboard-col center-col">
        {centerColumn}
      </div>

      {/* Stats sidebars grouped container - Placed Right in landscape grid */}
      <div className="stats-group-col">
        <div className="dashboard-col left-col">
          {leftColumn}
        </div>
        <div className="dashboard-col right-col">
          {rightColumn}
        </div>
      </div>
    </div>
  );
}
