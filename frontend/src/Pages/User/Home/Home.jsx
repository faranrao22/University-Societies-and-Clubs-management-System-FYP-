import React from 'react'
import HeroSection from '../../../sections/Home/HeroSection'
import Community from '../../../sections/Home/Community'
import FeaturesSection from '../../../sections/Home/FeaturesCard'
import HowItWorks from '../../../sections/Home/HowItWorks'
import UpcomingEvents from '../../../sections/Home/UpcomingEvents'
import SocietyPostsPreview from '../../../sections/Home/SocietyPostsPreview'


function Home() {
  return (
    <div>
        <HeroSection/>
        <FeaturesSection/>
      
        <HowItWorks />
        <SocietyPostsPreview />
     
        <UpcomingEvents/>
        <Community/> 
      
    </div>
  )
}

export default Home