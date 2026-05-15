import { s } from '@hashbrownai/core';
import { createTool } from '@hashbrownai/angular';

// Mock Analytics Service that returns dummy data
class MockAnalyticsService {
  getRevenueData(period: string) {
    return {
      period,
      totalRevenue: 4200000,
      trend: 'up',
      delta: 18,
      regionalBreakdown: [
        { region: 'North America', revenue: 2100000, trend: 'up' },
        { region: 'Europe', revenue: 1500000, trend: 'flat' },
        { region: 'Asia Pacific', revenue: 600000, trend: 'down' }
      ]
    };
  }

  getKpis() {
    return {
      activeUsers: { value: 1250000, trend: 'up', delta: 5 },
      npsScore: { value: 72, trend: 'flat', delta: 0 }
    };
  }

  searchReports(query: string) {
    // Basic mock implementation that ignores the query and returns generic results
    return [
      { id: '1', title: 'Q3 Financial Summary', snippet: 'Overall growth driven by NA market.' },
      { id: '2', title: 'User Engagement Metrics', snippet: 'Active users up 5% month over month.' }
    ];
  }
}

export function createChatTools() {
  const analytics = new MockAnalyticsService();

  const getRevenueTool = createTool({
    name: 'getRevenueTool',
    description: 'Get revenue data and regional breakdowns for a specific period (e.g. Q3 2025).',
    schema: s.object('Revenue period input', {
      period: s.string('The time period to query, e.g. "Q3 2025"'),
    }),
    handler: async ({ period }: { period: string }) => {
      // Return the mock data based on the requested period
      return analytics.getRevenueData(period);
    },
  });

  const getKpisTool = createTool({
    name: 'getKpisTool',
    description: 'Get current key performance indicators (KPIs) like active users or NPS score.',
    handler: async () => {
      return analytics.getKpis();
    },
  });

  const searchReportsTool = createTool({
    name: 'searchReportsTool',
    description: 'Search internal business reports for qualitative insights.',
    schema: s.object('Report search input', {
      query: s.string('Search terms to look for'),
    }),
    handler: async ({ query }: { query: string }) => {
      return analytics.searchReports(query);
    },
  });

  return [getRevenueTool, getKpisTool, searchReportsTool];
}
