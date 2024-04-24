import { useOutletContext, Link } from "react-router-dom";
import { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, CardGroup } from 'react-bootstrap';
import FullCalendar from '@fullcalendar/react'; // Import the FullCalendar component
import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin to display the calendar in a day grid view
import { getProfileIcon } from '../utilities/DefaultIconsUtilities';
import { getUserProfile } from '../utilities/UserProfileUtilities';


// Define the UserProfile component which accepts a user prop
export default function UserProfile({ user }) {
    // Use the OutletContext to get userProfileData and its setter function
    const { userProfileData, setUserProfileData } = useOutletContext();

    // State variables to hold various user and events related data
    const [eventsAttending, setEventsAttending] = useState([]);
    const [userEvents, setUserEvents] = useState([]);
    const [userInterests, setUserInterests] = useState([]);
    const [userPhoto, setUserPhoto] = useState(""); // Initialize userPhoto with an empty string
    const [icon, setIcon] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date()); // Holds the date selected in the calendar

    // useEffect to fetch profile and icon data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Use Promise.all for parallel asynchronous calls to get profile and icon data
                const [iconData, userProfile] = await Promise.all([getProfileIcon(), getUserProfile(user)]);
                setIcon(iconData);
                setUserProfileData(userProfile);
                setUserEvents(userProfile.user_events);
                setEventsAttending(userProfile.events_attending);
                setUserPhoto(userProfile.image);
                let interests = userProfile.interests.map(cat => cat.category);
                setUserInterests(interests);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                // Optionally, update the UI to show an error message here
            }
        };
        fetchData();
    }, [user, setUserProfileData]);

    // Handler for date click event on the calendar
    const handleDateClick = (arg) => {
        setSelectedDate(arg.date);
    };

    // Map events attending to the format required by FullCalendar
    const calendarEvents = eventsAttending.map(event => ({
        title: event.title,
        date: event.date,
        id: event.id,
    }));

    // Join user interests array into a string for display
    const userIntStr = userInterests.join(', ');

    // Function to render user's profile information using Card component
    const renderProfileInfo = () => (
        <Card className="text-center" style={{ width: '18rem' }}>
            <Card.Header>Profile Info</Card.Header>
            {/* Display user photo or a default icon if photo is not available */}
            <Card.Img variant="top" src={userPhoto || icon} style={{ height: '250px' }} alt={`${userProfileData.display_name}'s photo`} />
            <Card.Body>
                <Card.Title as='h3' style={{ fontWeight: 'bold', color: "#6840DF", textDecoration: 'underline' }}>
                    {userProfileData.display_name}
                </Card.Title>
                <br />
                <Card.Subtitle as='h4' style={{ fontWeight: 'bold' }}>Locations:</Card.Subtitle>
                <Card.Text>
                    {userProfileData.location}
                </Card.Text>
                <Card.Subtitle as='h4' style={{ fontWeight: 'bold' }}>Interests:</Card.Subtitle>
                <Card.Text>
                    {userIntStr}
                </Card.Text>
                <Button variant="info" as={Link} to={'/editprofile'}>
                    Edit Profile
                </Button>
            </Card.Body>
        </Card>
    );

    // Main component layout using Bootstrap's grid system
    return (
        <Container fluid>
            <Row className="justify-content-md-center">
                <Col md={3}>
                    {renderProfileInfo()}
                </Col>
                <Col md={4}>
                    <h1 style={{ color: '#6840DF' }}>Your Events</h1>
                    <Row>
                        {userEvents.length === 0 ?
                            <h3 style={{ fontStyle: 'italic' }}>Doesn't look like you have any events you're collaborating on at this time</h3> :
                            userEvents.map(event => (
                                <CardGroup key={event.id} className='p-2'>
                                    <Card style={{ width: '18rem' }}>
                                        <Card.Body>
                                            <Card.Title>{event.title}</Card.Title>
                                            <Card.Text>
                                                Date: {event.date}
                                                <br />
                                                Time: {event.time}
                                                <br />
                                                Event Type: {event.event_type}
                                            </Card.Text>
                                            <Button style={{ margin: 3 }} variant="info" as={Link} to={`/editevent/${event.id}`}>Edit Event Details</Button>
                                            <Button style={{ margin: 3 }} variant="info" as={Link} to={`/event/${event.id}`}>View Event Details</Button>
                                        </Card.Body>
                                    </Card>
                                </CardGroup>
                            ))}
                    </Row>
                    <Row>
                        <Button variant="primary" as={Link} to="/createevent">Create New Event</Button>
                    </Row>
                    <br />
                    <h1 style={{ color: '#6840DF' }}>Upcoming Events</h1>
                    <br />
                    <Row>
                        {eventsAttending.length > 0 ? eventsAttending.map(event => (
                            <CardGroup key={event.id} className='p-2'>
                                <Card key={event.id} style={{ width: '18rem' }}>
                                    <Card.Body>
                                        <Card.Title>{event.title}</Card.Title>
                                        <Card.Text>
                                            Date: {event.date}
                                            <br />
                                            Time: {event.time}
                                            <br />
                                            Event Type: {event.event_type}
                                        </Card.Text>
                                        <Button variant="info" as={Link} to={`/event/${event.id}`}>View Event Details</Button>
                                    </Card.Body>
                                </Card>
                            </CardGroup>
                        )) : <h3 style={{ fontStyle: 'italic' }}>Doesn't look like you've RSVP'd to any events yet.</h3>}
                    </Row>
                    <Row>
                    <Button variant="primary" as={Link} to="/events">I'm ready to make a difference!</Button>
                    </Row>
                </Col>
                <Col md={5}>
                    {/* FullCalendar component for displaying events in a monthly grid */} 
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        dateClick={handleDateClick}
                        events={calendarEvents}
                    />
                </Col>
            </Row>
        </Container>
    );
}
