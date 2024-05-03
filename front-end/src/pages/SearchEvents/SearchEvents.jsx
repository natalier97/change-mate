import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Button, Form, InputGroup, Container, Row, Col, Carousel } from 'react-bootstrap';
import './SearchEvents.css';
import EventCard from "../../components/EventCard";
import DropdownComponent from "../../components/AdvancedFilterButtons";
import { getEventDetailsSearch } from "../../utilities/EventUtilities";
import MapboxGeocoderComponent from "../../components/MapboxGeocoderComponent";
// import EventCard from "../../components/EventCard";


function SearchEvents() {
    const { userProfileData } = useOutletContext();
    const [userCoordinates, setUserCoordinates] = useState([]);
    const [distance, setDistance] = useState(100);

    const [searchEvents, setSearchEvents] = useState([]);
    // const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchSubmitted, setSearchSubmitted] = useState(false);

    
    const [searchTerm, setSearchTerm] = useState('');
    const [searchCoordinates, setSearchCoordinates] = useState([]);
    const [searchEventType, setSearchEventType] = useState('');

    // const [selectedDistance, setSelectedDistance] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStartDate, setSelectedStartDate] = useState('');
    const [selectedEndDate, setSelectedEndDate] = useState('');
    
    const [eventsPopular, setEventsPopular] = useState([]);
    // TODO: once we have a spot on our events to indicate whether volunteers are needed, we can add functionality to sort searchEvents into searchEventsVolNeed
    const [eventsVolNeed, setEventsVolNeed] = useState([]);
    const [eventsAdditional, setEventsAdditional] = useState([]);

    // const [searchType, setSearchType] = useState('');
    // const [searchDateStart, setSearchDateStart] = useState('');
    // const [searchDateEnd, setSearchDateEnd] = useState('');
   

    // console.log('userCoordinates', userCoordinates)
    console.log('searchEvents', searchEvents)
    // console.log('searchCoordinates', searchCoordinates)
    // console.log('filteredEvents', filteredEvents)

    const getUserCoordinates = async () => {
        setUserCoordinates(userProfileData.coordinates)
    }

    useEffect(() => {
        getUserCoordinates()
    }, [userProfileData]);

    // Gets events on render for events local to the user
    const getLocalEvents = async () => {
        if (userCoordinates && userCoordinates.length > 0){
            const allData = {
                "coordinates": userCoordinates,
                "distance": distance/60
            }
    
            console.log('allData', allData)
            getEventDetailsSearch(allData)
                .then((response) => {
                    setSearchEvents(response)
                })
        }
    }

    useEffect(() => {
        getLocalEvents()
    }, [userCoordinates]);
    
    // Handles searching for events
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Creates an object with all the search parameters
        const allData = {
            "type": searchEventType, 
            "coordinates": searchCoordinates,
            "distance": distance/60,
            "keyword": searchTerm,
            "start_date": selectedStartDate, 
            "end_date": selectedEndDate, 
            "category": selectedCategory
        }

        console.log(allData)

        // Calls the getEventDetailsSearch function from EventUtilities to get the events that match the search parameters
        getEventDetailsSearch(allData)
            .then((response) => {
                setSearchEvents(response)
                // Renders advanced search options
                setSearchSubmitted(true)
            })
    }

    useEffect(() => {
        sortPopularEvents(searchEvents)
        sortVolunteerEvents(searchEvents)
    }, [searchEvents]);

    // Sorts the events returned from the search into eventsPopular
    const sortPopularEvents = async (events) => {
        const popEvents = []
        const unpopEvents = []
        // Loops through the searchEvents to determine if event is popular or not and sorts them into their respective categories
        for (const event of events) {
            // TODO: DEPLOYMENT - Currently for development purposes an event is popular if more than 1 user is attending; Before deployment we must chnage this to a more reasonable real-world threshhold
            if (event.num_users_attending > 1) {
                popEvents.push(event)
            } else {
                unpopEvents.push(event)
            }

        }
        // Sets popular events to eventsPopular and not popular events to eventsAdditional
        setEventsPopular(popEvents)
        setEventsAdditional(unpopEvents)
    }
    // Not funtional yet; Awaiting backend to add volunteers_needed to the model serializer
    const sortVolunteerEvents = async (events) => {
        const needVol = []
        // Loops through the searchEvents to determine if event needs volunteers
        for (const event of events) {
            if (event.volunteers_needed) {
                needVol.push(event)
            }
        }
        // Sets events that need volunteers to the eventsVolNeed
        setEventsVolNeed(needVol)

    }

    // Chunks results of popular events, volunteer events and additional events into groups of three for rendering
    function chunkArray(array, chunkSize) {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    const popularGroupedEvents = chunkArray(eventsPopular, 3);
    const volunteerGroupedEvents = chunkArray(eventsVolNeed, 3);
    const additionalGroupedEvents = chunkArray(eventsAdditional, 3);

    // SAVE THIS! Can't do this now, but this function is almost set up to filter search events result on front end to reduce api calls; we need the event to have lat and lon included in the serializer to be able to do though so we can calculate the radius on the front end.
    //     useEffect(() => {
    //     // Function to check if an event matches the filter criteria
    //     const matchesFilterCriteria = (event) => {
    //         // Check if the event matches the selected category
    //         const matchesCategory = selectedCategory ? event.category.category === selectedCategory : true;

    //         // Check if the event falls within the selected start and end dates
    //         const startDateCondition = selectedStartDate ? event.startDate >= selectedStartDate : true;
    //         const endDateCondition = selectedEndDate ? event.startDate <= selectedEndDate : true;

    //         // TODO: add locationCondition once searching by location radius works

    //         return matchesCategory && startDateCondition && endDateCondition;
    //     };

    //     // Apply filters to searchEvents based on category, start date, and end date
    //     const filteredEventsData = searchEvents.filter(event => matchesFilterCriteria(event));
        
    //     // Set the filtered events
    //     setFilteredEvents(filteredEventsData);
    // }, [selectedCategory, selectedStartDate, selectedEndDate]);

      // useEffect(() => {
    //     sortPopularEvents(filteredEvents)
    //     sortVolunteerEvents(filteredEvents)
    // }, [filteredEvents]);

    
    
    return (
        <div className="search-events p-4">
            <div className="search-events-background">
                {/* This container-fluid will apply to the overall layout, allowing sections like event cards to stretch fully */}
                <div className="container-fluid mt-5">
                    <div className="row">
                        <div className="col-md-10 mx-auto">
                            <h2 className="mb-4" style={{ textAlign: 'center' }}>Search Events</h2>
                            <Form onSubmit={handleSubmit} className="shadow p-3 mb-5 bg-white rounded">
                                <Row>
                                    <Col md={4}>
                                        <InputGroup>
                                            <InputGroup.Text>Keyword</InputGroup.Text>
                                            <Form.Control aria-label="Keyword search" onChange={(e) => setSearchTerm(e.target.value)} />
                                        </InputGroup>
                                    </Col>
                                    <Col md={4}>
                                        <InputGroup>
                                            <InputGroup.Text>Location</InputGroup.Text>
                                            <MapboxGeocoderComponent
                                                setCoords={setSearchCoordinates}
                                            />
                                        </InputGroup>
                                    </Col>
                                    <Col md={3}>
                                        <InputGroup>
                                        <InputGroup.Text>Type</InputGroup.Text>
                                        <Form.Select onChange={(e) => setSearchEventType(e.target.value)} defaultValue="In-person" >
                                            <option value="In-person">In-Person</option>
                                            <option value="Virtual">Virtual</option>
                                        </Form.Select>
                                        </InputGroup>
                                    </Col>
                                    <Col md={1}>
                                        <Button variant="primary" type="submit" className="w-100">Search</Button>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
                                
            {/* Conditionally render component W/ searchSubmitted and pass query setSelectedCategory for subquery*/}
            {searchSubmitted && <DropdownComponent setSelectedCategory={setSelectedCategory} setSelectedStartDate={setSelectedStartDate} setSelectedEndDate={setSelectedEndDate} setDistance={setDistance} />} 

            {/* Popular Events with Carousel */}
            <div className="search-events p-4">
                <Container fluid className="mt-5">
                    <h2 className="text-center">Popular Events</h2>
                    {eventsPopular.length === 0 ? (
                        <p className="text-muted text-center">No popular events found.</p>
                    ) : (
                        <Carousel interval={null} indicators={true}>
                            {popularGroupedEvents.map((group, index) => (
                                <Carousel.Item key={index}>
                                    <Row className="justify-content-center">
                                        {group.map((event) => (
                                            <Col key={event.id} xs={12} md={4} className="d-flex align-items-stretch">
                                                <EventCard {...event} />
                                            </Col>
                                        ))}
                                    </Row>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    )}
                </Container>
                
                {/* Volunteer Events with Carousel */}
                <Container fluid className="mt-5">
                    <h2 className="text-center">Events Needing Volunteers</h2>
                    {eventsVolNeed.length === 0 ? (
                        <p className="text-muted text-center">No events needing volunteers found.</p>
                    ) : (
                        <Carousel interval={null} indicators={true}>
                            {volunteerGroupedEvents.map((group, index) => (
                                <Carousel.Item key={index}>
                                    <Row className="justify-content-center">
                                        {group.map((event) => (
                                            <Col key={event.id} xs={12} md={4} className="d-flex align-items-stretch">
                                                <EventCard {...event} />
                                            </Col>
                                        ))}
                                    </Row>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    )}
                </Container>
                
                {/* Additional Events with Carousel */}
                <Container fluid className="mt-5">
                    <h2 className="text-center">Additional Events</h2>
                    {eventsAdditional.length === 0 ? (
                        <p className="text-muted text-center">No other events found.</p>
                    ) : (
                        <Carousel interval={null} indicators={true}>
                            {additionalGroupedEvents.map((group, index) => (
                                <Carousel.Item key={index}>
                                    <Row className="justify-content-center">
                                        {group.map((event) => (
                                            <Col key={event.id} xs={12} md={2} className="d-flex align-items-stretch">
                                                <EventCard {...event} />
                                            </Col>
                                        ))}
                                    </Row>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    )}
                </Container>
            </div>
        </div>
    );
}
export default SearchEvents;