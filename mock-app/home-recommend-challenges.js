import {visibleOffers,challengeSlots} from './model.js';
import {homeRecommendSettings,recommendChallengeSlots} from './home-recommend-settings.js';
export function homeChallengeOffers(state){const eligible=new Map(visibleOffers(state).map(offer=>[offer.id,offer]));return challengeSlots(state).map(slot=>eligible.get(slot.destination)).filter(Boolean);}
export function homeRecommendationChallenges(state){return recommendChallengeSlots(homeChallengeOffers(state),homeRecommendSettings(state),challengeSlots(state));}
