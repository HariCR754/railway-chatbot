from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
import random
import datetime

# Mock database
MOCK_TRAINS = {
    "12345": {
        "name": "Rajdhani Express",
        "departure": "Mumbai",
        "destination": "Delhi",
        "departure_time": "16:00",
        "arrival_time": "08:00",
        "duration": "16 hours"
    },
    "12346": {
        "name": "Shatabdi Express",
        "departure": "Bangalore",
        "destination": "Chennai",
        "departure_time": "06:00",
        "arrival_time": "11:00",
        "duration": "5 hours"
    }
}

MOCK_FARES = {
    ("Mumbai", "Delhi"): {
        "1AC": {"base": 3500, "reservation": 300, "gst": 350},
        "2AC": {"base": 2500, "reservation": 200, "gst": 250},
        "3AC": {"base": 1500, "reservation": 150, "gst": 150},
        "SL": {"base": 800, "reservation": 100, "gst": 80},
        "General": {"base": 500, "reservation": 50, "gst": 50}
    },
    ("Bangalore", "Chennai"): {
        "1AC": {"base": 2500, "reservation": 250, "gst": 250},
        "2AC": {"base": 1500, "reservation": 150, "gst": 150},
        "3AC": {"base": 1000, "reservation": 100, "gst": 100},
        "SL": {"base": 500, "reservation": 50, "gst": 50},
        "General": {"base": 300, "reservation": 30, "gst": 30}
    }
}

class ActionValidateBooking(Action):
    def name(self) -> Text:
        return "action_validate_booking"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        date_str = tracker.get_slot("date")
        try:
            datetime.datetime.strptime(date_str, "%d-%m-%Y")
        except ValueError:
            dispatcher.utter_message(text="Please enter date in DD-MM-YYYY format.")
            return []
        
        return []

class ActionGeneratePNR(Action):
    def name(self) -> Text:
        return "action_generate_pnr"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        departure = tracker.get_slot("departure")
        destination = tracker.get_slot("destination")
        class_type = tracker.get_slot("class_type")
        
        # Calculate fare
        fare_data = MOCK_FARES.get((departure, destination), {}).get(class_type, {})
        total_fare = fare_data.get("base", 0) + fare_data.get("reservation", 0) + fare_data.get("gst", 0)
        
        pnr = "RAIL" + str(random.randint(100000, 999999))
        dispatcher.utter_message(
            response="utter_booking_complete",
            random_num=pnr[4:],
            fare=total_fare
        )
        return []

class ActionLookupSchedule(Action):
    def name(self) -> Text:
        return "action_lookup_schedule"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        train_number = tracker.get_slot("train_number")
        train_data = MOCK_TRAINS.get(train_number, {})
        
        if train_data:
            dispatcher.utter_message(
                response="utter_provide_schedule",
                train_number=train_number,
                train_name=train_data.get("name", ""),
                departure=train_data.get("departure", ""),
                departure_time=train_data.get("departure_time", ""),
                destination=train_data.get("destination", ""),
                arrival_time=train_data.get("arrival_time", ""),
                duration=train_data.get("duration", "")
            )
        else:
            dispatcher.utter_message(text=f"Sorry, I couldn't find schedule for train {train_number}.")
        
        return []

class ActionLookupFare(Action):
    def name(self) -> Text:
        return "action_lookup_fare"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        departure = tracker.get_slot("departure")
        destination = tracker.get_slot("destination")
        class_type = tracker.get_slot("class_type")
        
        fare_data = MOCK_FARES.get((departure, destination), {}).get(class_type, {})
        
        if fare_data:
            dispatcher.utter_message(
                response="utter_provide_fare",
                class_type=class_type,
                departure=departure,
                destination=destination,
                base_fare=fare_data.get("base", 0),
                reservation_charge=fare_data.get("reservation", 0),
                gst=fare_data.get("gst", 0),
                total_fare=fare_data.get("base", 0) + fare_data.get("reservation", 0) + fare_data.get("gst", 0)
            )
        else:
            dispatcher.utter_message(text="Sorry, I couldn't find fare information for this route.")
        
        return []