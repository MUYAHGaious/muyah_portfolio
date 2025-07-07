import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
// Add your imports here
import PortfolioHomepage from "pages/portfolio-homepage";
import ProjectPortfolioGallery from "pages/project-portfolio-gallery";
import ProjectCaseStudyDetail from "pages/project-case-study-detail";
import ProfessionalExperienceTimeline from "pages/professional-experience-timeline";
import ContactCollaborationHub from "pages/contact-collaboration-hub";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your routes here */}
        <Route path="/" element={<PortfolioHomepage />} />
        <Route path="/portfolio-homepage" element={<PortfolioHomepage />} />
        <Route path="/project-portfolio-gallery" element={<ProjectPortfolioGallery />} />
        <Route path="/project-case-study-detail" element={<ProjectCaseStudyDetail />} />
        <Route path="/professional-experience-timeline" element={<ProfessionalExperienceTimeline />} />
        <Route path="/contact-collaboration-hub" element={<ContactCollaborationHub />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;