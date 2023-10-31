import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";

import FacilityCard from "./FacilityCard";

const Facilities = (): JSX.Element => {
  const { data, isPending } = useQuery({
    queryKey: ["facilities"],
    queryFn: async () => {
      const response = await axios.get<FacilityData[]>(
        "http://localhost:3000/dashboard",
        {
          withCredentials: true,
        }
      );
      console.log(response.data);
      return response.data;
    },
  });

  return (
    <div className="w-[80%] h-full flex flex-col items-center justify-center text-black px-6 pt-12">
      <h1 className="uppercase">FACILITIES</h1>
      <div className="w-full flex justify-center items-center flex-wrap pt-4">
        {!isPending &&
          data?.map((facility: FacilityData) => (
            <Link to={`/facility/${facility.slug}`} key={facility.name}>
              <FacilityCard name={facility.name} icon={facility.icon} />
            </Link>
          ))}
      </div>
    </div>
  );
};

export default Facilities;
