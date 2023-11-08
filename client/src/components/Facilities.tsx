import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FC } from "react";
import axios from "axios";

import FacilityCard from "./FacilityCard";
import { CircularProgress, Typography } from "@mui/material";

const Facilities: FC = (): JSX.Element => {
  const { data, isPending } = useQuery({
    queryKey: ["facilities"],
    queryFn: async () => {
      const response = await axios.get<DashboardData>(
        "http://localhost:3000/dashboard",
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  });

  if (isPending)
    return (
      <div className="w-full min-h-screen h-full flex flex-col items-center justify-center">
        <CircularProgress />
      </div>
    );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pt-12">
      <Typography variant="h2" component="h1">
        Facilities
      </Typography>
      <div className="w-full flex justify-center items-center flex-wrap pt-4">
        {!isPending &&
          data?.facilities.map((facility: FacilityData) => (
            <Link to={`/facility/${facility.slug}`} key={facility.name}>
              <FacilityCard
                name={facility.name}
                icon={facility.icon}
                manager={facility.facilityManager.user.name}
              />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Facilities;
