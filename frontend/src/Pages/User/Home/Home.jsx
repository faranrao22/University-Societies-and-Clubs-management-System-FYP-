import React from 'react'
import Topbar from '../../../Components/Topbar'
import Navbar from '../../../Components/Navbar'
import HeroSection from '../../../sections/Home/HeroSection'
import Community from '../../../sections/Home/Community'
import Events from '../../../sections/Home/Events'
import VotePage from '../../../sections/Home/Vote'
import VoteElectionsPage from '../../../sections/Home/Vote'
import UpcomingElections from '../../../sections/Home/UpcomingElections'
import FeaturesSection from '../../../sections/Home/FeaturesCard'
import UpcomingEvents from '../../../sections/Home/UpcomingEvents'


function Home() {
  return (
    <div>
        <HeroSection/>
        <FeaturesSection/>
        <UpcomingEvents/>
         <Community/> 
        {/* <UpcomingElections/>
        <VoteElectionsPage/> */}
      
    </div>
  )
}

export default Home