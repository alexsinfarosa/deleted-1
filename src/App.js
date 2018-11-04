import React, { Component } from "react";
import { AppProvider } from "./AppContext";

import axios from "axios";
import { PROXYDARKSKY } from "./utils/api";

import CircularProgress from "@material-ui/core/CircularProgress";

import Main from "./Main";
import Landing from "./Landing";

import differenceInHours from "date-fns/differenceInHours";
import { getPET } from "./utils/utils";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      mainIdx: 1,
      landingIdx: 0,
      isLanding: false,

      id: null,
      soilCapacity: "medium",
      cropType: "grass",
      fieldName: "",
      address: "",
      latitude: null,
      longitude: null,
      irrigationDate: new Date(),
      dataModel: [],

      fields: [],

      handleIrrigationDate: this.handleIrrigationDate,
      handleField: this.handleField,
      addField: this.addField,
      selectField: this.selectField,
      deleteField: this.deleteField,
      handleIndex: this.handleIndex,
      navigateToMain: this.navigateToMain,
      navigateToLanding: this.navigateToLanding,
      forecastData: [],
      fetchForecastData: this.fetchForecastData
    };
  }

  // NAVIGATION-------------------------------------------------------------
  navigateToMain = mainIdx => this.setState({ mainIdx, isLanding: false });
  navigateToLanding = () =>
    this.setState({ mainIdx: 1, isLanding: true, landingIdx: 1 });

  // HANDLING EVENTs--------------------------------------------------------
  handleIndex = (idx, comp) => this.setState({ [comp]: idx });
  handleField = ({ ...field }) => this.setState({ ...field });
  handleIrrigationDate = irrigationDate => this.setState({ irrigationDate });

  // CRUD OPERATIONS--------------------------------------------------------
  addField = async () => {
    this.setState({ isLoading: true });
    // await this.fetchForecastData(this.state.latitude, this.state.longitude);
    const dataModel = await getPET(
      this.state.irrigationDate,
      this.state.latitude,
      this.state.longitude,
      this.state.soilCapacity
    );

    const field = {
      id: Date.now(),
      fieldName: this.state.address.split(",")[0],
      soilCapacity: this.state.soilCapacity,
      cropType: this.state.cropType,
      address: this.state.address,
      latitude: this.state.latitude,
      longitude: this.state.longitude,
      irrigationDate: this.state.irrigationDate,
      forecastData: this.state.forecastData,
      dataModel: dataModel
    };
    const fields = [field, ...this.state.fields];
    this.setState({ dataModel, fields, isLoading: false });
    this.writeToLocalstorage(fields);
  };

  deleteField = id => {
    const copyFields = [...this.state.fields];
    const fields = copyFields.filter(field => field.id !== id);

    this.setState({
      fields,
      isLanding: fields.length === 0 ? true : false,
      landingIdx: 0
    });

    fields.length === 0
      ? this.deleteFromLocalstorage()
      : this.writeToLocalstorage(fields);
  };

  selectField = async id => {
    this.setState({ isLoading: true });
    const field = this.state.fields.find(field => field.id === id);
    this.setState({
      id: field.id,
      fieldName: field.fieldName,
      soilCapacity: field.soilCapacity,
      cropType: field.cropType,
      address: field.address,
      latitude: field.latitude,
      longitude: field.longitude,
      irrigationDate: field.irrigationDate,
      forecastData: field.forecastData,
      dataModel: field.dataModel
    });
    // console.log(field);
    const countHrs = differenceInHours(new Date(), new Date(field.id));

    if (countHrs > 3) {
      console.log("more than 3 hours...");
      const dataModel = await getPET(
        this.state.irrigationDate,
        this.state.latitude,
        this.state.longitude,
        this.state.soilCapacity
      );
      const forecastData = this.fetchForecastData(
        this.state.latitude,
        this.state.longitude
      );
      this.setState({ dataModel, forecastData });

      const idx = this.state.fields.findIndex(
        field => field.id === this.state.id
      );
      const copyFields = [...this.state.fields];
      copyFields[idx].id = Date.now();
      copyFields[idx].dataModel = dataModel;
      copyFields[idx].forecastData = forecastData;

      this.writeToLocalstorage(copyFields);
    }
    this.setState({ isLoading: false });
  };

  fetchForecastData = (latitude, longitude) => {
    console.log("fetchForecastData called");
    // this.setState({ isLoading: true });
    const url = `${PROXYDARKSKY}/${latitude},${longitude}?exclude=flags,minutely,alerts,hourly`;
    return axios
      .get(url)
      .then(res => {
        // console.log(res.data);
        const { currently, daily } = res.data;
        const forecastData = { currently, daily };
        return forecastData;
      })
      .catch(err => {
        console.log("Failed to load forecast weather data", err);
        this.setState({ isLoading: false });
      });
  };

  // LOCALSTORAGE------------------------------------------------------------
  writeToLocalstorage = fields => {
    console.log("writeToLocalstorage");
    localStorage.setItem("nrcc-irrigation-tool", JSON.stringify(fields));
  };

  readFromLocalstorage = () => {
    const localStorageRef = localStorage.getItem("nrcc-irrigation-tool");
    // console.log(localStorageRef);
    if (localStorageRef) {
      const params = JSON.parse(localStorageRef);
      const field = {
        id: params[0].id,
        fieldName: params[0].fieldName,
        soilCapacity: params[0].soilCapacity,
        cropType: params[0].cropType,
        address: params[0].address,
        latitude: params[0].latitude,
        longitude: params[0].longitude,
        irrigationDate: new Date(params[0].irrigationDate),
        forecastData: params[0].forecastData,
        dataModel: params[0].dataModel
      };

      this.setState({ fields: params, ...field });
    }
  };

  deleteFromLocalstorage = () => {
    localStorage.removeItem("nrcc-irrigation-tool");
  };

  // LIFE CYLCES--------------------------------------------------------------
  async componentDidMount() {
    this.setState({ isLoading: true });
    try {
      await this.readFromLocalstorage();
      if (this.state.fields.length !== 0) {
        const countHrs = differenceInHours(new Date(), new Date(this.state.id));
        if (countHrs > 3) {
          console.log("more than 3 hours...");
          const dataModel = await getPET(
            this.state.irrigationDate,
            this.state.latitude,
            this.state.longitude,
            this.state.soilCapacity
          );
          const forecastData = this.fetchForecastData(
            this.state.latitude,
            this.state.longitude
          );
          this.setState({ dataModel, forecastData });

          const idx = this.state.fields.findIndex(
            field => field.id === this.state.id
          );
          const copyFields = [...this.state.fields];
          copyFields[idx].id = Date.now();
          copyFields[idx].dataModel = dataModel;
          copyFields[idx].forecastData = forecastData;

          this.writeToLocalstorage(copyFields);
        }
      }
      this.setState({ isLoading: false });
    } catch (error) {
      console.log(error);
      this.setState({ isLoading: false });
    }
  }

  render() {
    const { fields, isLanding } = this.state;
    return (
      <AppProvider value={this.state}>
        {this.state.isLoading ? (
          <div
            style={{
              height: window.innerHeight,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <CircularProgress />
          </div>
        ) : fields.length === 0 || isLanding ? (
          <Landing />
        ) : (
          <Main />
        )}
      </AppProvider>
    );
  }
}

export default App;
