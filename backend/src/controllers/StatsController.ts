/**
 * Controller for portfolio statistics endpoints.
 * Aggregates career, project, stack and service counts for the public dashboard.
 */
import type { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { appEnv } from '../config/env';

const MONTH_MAP: Record<string, number> = {
  jan: 0,
  fev: 1,
  mar: 2,
  abr: 3,
  mai: 4,
  jun: 5,
  jul: 6,
  ago: 7,
  set: 8,
  out: 9,
  nov: 10,
  dez: 11,
};

/**
 * Parses the start date from a CareerEntry period string.
 * Accepted formats: "Ago/2012 - Dez/2018" or "Fev/2025 - Atual".
 * Returns a Date for the start portion, or null if it cannot be parsed.
 */
function parseStartDate(period: string): Date | null {
  const startPart = period.split('-')[0].trim();
  const match = startPart.match(/^([A-Za-z]{3})\/(\d{4})$/);
  if (!match) {
    return null;
  }
  const monthKey = match[1].toLowerCase();
  const year = parseInt(match[2], 10);
  const monthIndex = MONTH_MAP[monthKey];
  if (monthIndex === undefined || isNaN(year)) {
    return null;
  }
  return new Date(year, monthIndex, 1);
}

/**
 * Calculates total career years from the earliest period start to now.
 * Returns a string like "13+" or "0".
 */
function calculateTotalYears(periods: string[]): string {
  let earliest: Date | null = null;

  for (const period of periods) {
    const start = parseStartDate(period);
    if (!start) continue;
    if (!earliest || start < earliest) {
      earliest = start;
    }
  }

  if (!earliest) {
    return '0';
  }

  const now = new Date();
  const diffMs = now.getTime() - earliest.getTime();
  const diffYears = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
  return `${diffYears}+`;
}

/**
 * Exposes portfolio statistics for the public dashboard.
 */
export class StatsController {
  /**
   * Returns portfolio statistics calculated dynamically from the database.
   * Public endpoint — no authentication required.
   */
  getPublic = async (req: Request, res: Response): Promise<Response> => {
    try {
      const user = await prisma.user.findFirst({
        where: { email: appEnv.defaultEmail },
      });

      if (!user) {
        return res.json(buildEmptyStats());
      }

      const userId = user.id;

      const [careerEntries, projects, projectImages, projectsWithIA, stackDetails, services, contacts, educations, settings] =
        await Promise.all([
          prisma.careerEntry.findMany({
            where: { userId },
            select: { startDate: true, endDate: true },
            orderBy: { startDate: 'asc' },
          }),
          prisma.project.findMany({
            where: { userId },
            select: { technologies: true, githubUrl: true },
          }),
          prisma.projectImage.findMany({
            where: { project: { userId } },
            select: { id: true },
          }),
          prisma.project.count({
            where: {
              userId,
              categories: {
                some: {
                  category: {
                    slug: { in: ['ia-generativa', 'machine-learning', 'nlp', 'computer-vision'] },
                  },
                },
              },
            },
          }),
          prisma.stackDetail.findMany({
            where: { userId },
            select: { categoryId: true, startYear: true, endYear: true, level: true, patterns: true, solutions: true },
            orderBy: { startYear: 'asc' },
          }),
          prisma.service.count({ where: { userId } }),
          prisma.contactInfo.count({ where: { userId } }),
          prisma.education.count({ where: { userId } }),
          prisma.siteSettings.findUnique({ where: { userId } }),
        ]);

      // Career calculations
      const totalEntries = careerEntries.length;
      const totalDomains = await prisma.domain.count({ where: { userId } });

      // Calculate years from earliest startDate
      let totalYears = '0';
      if (careerEntries.length > 0) {
        const earliest = careerEntries[0].startDate; // already sorted asc
        const diffMs = Date.now() - earliest.getTime();
        const years = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25));
        totalYears = `${years}+`;
      }

      // Projects calculations
      const allTechnologies = projects.flatMap((p) => p.technologies);
      const uniqueTechnologies = new Set(allTechnologies);
      const githubRepos = projects.filter((p) => p.githubUrl !== null).length;

      // Stacks calculations
      const uniqueCategories = new Set(stackDetails.map((s) => s.categoryId));
      const currentYear = new Date().getFullYear();
      const stackYears = stackDetails.map((s) => (s.endYear ?? currentYear) - s.startYear);
      const avgYears = stackYears.length > 0 ? Math.round((stackYears.reduce((a, b) => a + b, 0) / stackYears.length) * 10) / 10 : 0;
      const oldestStack = stackDetails.length > 0 ? stackDetails[0] : null;
      const expertCount = stackDetails.filter((s) => s.level === 'Especialista').length;
      const advancedCount = stackDetails.filter((s) => s.level === 'Avançado').length;
      const levelDistribution = {
        Especialista: expertCount,
        'Avançado': advancedCount,
        'Intermediário': stackDetails.filter((s) => s.level === 'Intermediário').length,
        'Básico': stackDetails.filter((s) => s.level === 'Básico').length,
      };

      return res.json({
        career: {
          totalEntries,
          totalYears,
          totalDomains,
          totalPatterns: new Set(stackDetails.flatMap((s) => s.patterns)).size,
        },
        projects: {
          totalProjects: projects.length,
          totalTechnologies: uniqueTechnologies.size,
          totalImages: projectImages.length,
          githubRepos,
          projectsWithIA: projectsWithIA,
        },
        stacks: {
          totalStacks: stackDetails.length,
          totalCategories: uniqueCategories.size,
          expertCount,
          advancedCount,
          avgYears,
          oldestStartYear: oldestStack?.startYear ?? null,
          levelDistribution,
        },
        services: {
          totalServices: services,
        },
        contacts: {
          totalContacts: contacts,
        },
        education: {
          totalEducations: educations,
        },
        pageConfig: settings ? {
          projectsPageTitle: settings.projectsPageTitle,
          projectsPageSubtitle: settings.projectsPageSubtitle,
          projectsGithubUrl: settings.projectsGithubUrl,
          projectsGithubLabel: settings.projectsGithubLabel,
          projectsGithubHint: settings.projectsGithubHint,
          careerPageTitle: settings.careerPageTitle,
          careerPageSubtitle: settings.careerPageSubtitle,
          stacksPageTitle: settings.stacksPageTitle,
          stacksPageSubtitle: settings.stacksPageSubtitle,
        } : null,
      });
    } catch (error: any) {
      console.error('Error in stats getPublic:', error?.message || error);
      return res.json(buildEmptyStats());
    }
  };
}

/**
 * Returns a zeroed-out stats object used as fallback when no user is found.
 */
function buildEmptyStats() {
  return {
    career: {
      totalEntries: 0,
      totalYears: '0',
      totalDomains: 0,
      totalPatterns: 0,
    },
    projects: {
      totalProjects: 0,
      totalTechnologies: 0,
      totalImages: 0,
      githubRepos: 0,
      projectsWithIA: 0,
    },
    stacks: {
      totalStacks: 0,
      totalCategories: 0,
      expertCount: 0,
      advancedCount: 0,
      avgYears: 0,
      oldestStartYear: null,
      levelDistribution: { Especialista: 0, 'Avançado': 0, 'Intermediário': 0, 'Básico': 0 },
    },
    services: {
      totalServices: 0,
    },
    contacts: {
      totalContacts: 0,
    },
    education: {
      totalEducations: 0,
    },
    pageConfig: null,
  };
}
